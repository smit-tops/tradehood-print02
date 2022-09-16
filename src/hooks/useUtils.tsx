import React, { useCallback, useContext, useEffect, useState } from 'react'
import { LoginContext } from 'renderer/components/Context';

const ipcRenderer = window.electron.ipcRenderer;

const useUtils = () => {

    const {
        printers,
    } = useContext(LoginContext);

    const [reportStats, setReportStat] = useState({ success: 0, failed: 0, });


    const downloadPdf = useCallback(async (path: string) => {
        return await ipcRenderer.invoke('download', {
            file: path,
        });
    }, []);

    const reportSuccess = useCallback(() => {
        console.log("calling");

        setReportStat((prev: any) => {
            console.log("calling prev", prev);
            return { ...prev, success: prev.success + 1 };
        });
    }, [setReportStat, reportStats]);

    useEffect(() => {
      console.log("calling");
      
    }, [reportStats])
    

    const reportFailed = useCallback(() => {
        setReportStat((prev: any) => {
            return { ...prev, failed: prev.failed + 1 };
        });
    }, [setReportStat, reportStats]);

    const getItemValue = useCallback(
        (label: string) => {
            return printers.find((item: any) => item.label === label)
                ? { label, value: label }
                : false;
        },
        [printers]
    );

    return { downloadPdf, reportSuccess, reportFailed, getItemValue, reportStats }
}

export default useUtils