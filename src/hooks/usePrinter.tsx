import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { LoginContext } from '../renderer/components/Context';
import 'react-circular-progressbar/dist/styles.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { fetchPrintLabel } from '../Apis/fetchLabels';
import { updateLabelFlag } from '../Apis/updateLabelFlag';
import { Printer, PrintOptions } from 'pdf-to-printer';
import { PrinterType } from 'renderer/consts/enums';
import useUtils from './useUtils';

const ipcRenderer = window.electron.ipcRenderer;

export const usePrinter = () => {

    const {
        setPrinters,
        printers,
        setSelectedPrinter,
        selectedPrinter,
    } = useContext(LoginContext);

    const {
        downloadPdf,
        reportSuccess,
        reportFailed,
        getItemValue,
        reportStats } = useUtils()

    const [loading, setLoading] = useState<boolean>(false);
    const [percent, setPercent] = useState<number>(0);
    const [isPrinting, setPrinting] = useState<boolean>(false);
    const [start, setStart] = useState<boolean>(false);
    const [availableLabels, setAvailableLabels] = useState<number>(1)

    const timeoutId: any = useRef(null);
    const counter = useRef(0);
    const abort = useRef(false);
    const printedLabels = useRef<string[]>([])

    useEffect(() => {
        const fetchPrinters = async () => {
            try {
                setLoading(true);
                const fetchPrinter = await ipcRenderer.invoke('getPrinters');
                const selectedPrinters = await ipcRenderer.invoke('getSelectedPrinters');
                selectedPrinters && setSelectedPrinter(selectedPrinters);
                setPrinters(fetchPrinter);
                setLoading(false);
            } catch (error: any) {
                setLoading(false);
                confirmAlert({
                    title: 'Server Error',
                    message: error,
                });
            }
        };

        fetchPrinters();
    }, []);

    const isPrintersSelected = useMemo(() => {
        return (
            getItemValue(selectedPrinter?.boxPrinter) &&
            getItemValue(selectedPrinter?.labelPrinter)
        );
    }, [selectedPrinter, printers]);

    const getPrinterType = useCallback((printerType: string) => {
        const boxPrinterOption: PrintOptions = {
            printer: selectedPrinter?.boxPrinter,
            printDialog: false,
            monochrome: true,
            silent: false,
            scale: 'fit',
        };

        const itemPrinterOption: PrintOptions = {
            printer: selectedPrinter?.labelPrinter,
            printDialog: false,
            monochrome: true,
            silent: false,
        };

        if (selectedPrinter?.scale?.length > 0) itemPrinterOption.scale = selectedPrinter?.scale

        return printerType === PrinterType.boxPrinter
            ? boxPrinterOption
            : itemPrinterOption;
    }, [selectedPrinter, PrinterType])

    const handlePrint = async () => {
        printedLabels.current = []
        abort.current = false;
        if (!isPrintersSelected) {
            return confirmAlert({
                title: 'Not Found Error',
                message: 'Printer not selected',
            });
        }
        try {
            setStart(true);
            const printLabels = await fetchPrintLabel();

            if (printLabels && printLabels.length > 0) {
                counter.current = counter.current + 1
                setPrinting(true)
                setAvailableLabels(printLabels.length)

                for (let [i, printLabel] of printLabels.entries()) {
                    const printerOptions = getPrinterType(printLabel.printer_type);
                    const { isSucceded, path } = await downloadPdf(printLabel.file_path);
                    if (abort.current) { handleStop(); break; }
                    isSucceded ? await printPdf(path, printerOptions, printLabel.id) : reportFailed();
                    setPercent(Math.round(((i + 1) / printLabels.length) * 100));
                }

            } else {
                counter.current = 0
                setAvailableLabels(0)
            }

            setPercent(0);
            setPrinting(false);
            await updateAllLables(printedLabels.current);
            clearTimeout(timeoutId.current)

            abort.current ? setLoading(false) : timeoutId.current = setTimeout(() => handlePrint(), 5 * 1000)

        } catch (error) {
            await updateAllLables(printedLabels);
            handleStop();
            confirmAlert({
                title: 'Server Error',
                message: `${error}`,
            });
            abort.current = false
            setLoading(false)
        }

        setLoading(false)
    };

    const printPdf = useCallback(async (path: string, printerOption: PrintOptions, id: string) => {

        const printed = await ipcRenderer.invoke("printPdf", { path, printerOption })

        if (!printed) {
            handleStop()
            return confirmAlert({
                title: 'Printer Error',
                message: `Something went wrong please try again`,
            });
        }
        printedLabels.current = [...printedLabels.current, id]
        reportSuccess();
    }, [reportSuccess]);

    const handleStop = useCallback(() => {
        abort.current = true;
        if (availableLabels > 0)
            setLoading(true)
        clearInterval(timeoutId.current);
        setStart(false);
        setPrinting(false);
        setPercent(0)
    }, [timeoutId.current, start, isPrinting, abort.current, percent]);

    const updateAllLables = useCallback(async (labels: any) => {
        try {
            if (labels.length > 0) {
                setLoading(true)
                await updateLabelFlag(labels);
                printedLabels.current = []
                await ipcRenderer.invoke('deleteFolder');
            }
        } catch {
            handleStop();
            confirmAlert({
                title: 'Server Error',
                message: `Internal Server Error Try Again After some Time`,
            });
        }
        setAvailableLabels(0)
        setLoading(false)
    }, [handleStop]);

    return { loading, handlePrint, handleStop, isPrinting, start, reportStats, availableLabels, percent }
}

