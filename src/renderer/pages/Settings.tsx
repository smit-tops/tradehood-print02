import React, { useCallback, useContext, useMemo } from 'react';
import Navbar from 'renderer/components/Navbar';
import { LoginContext } from '../components/Context';
import Select from 'react-select';
import { ErrorBoundary } from 'renderer/components/ErrrorBoundary';
import { Link } from 'react-router-dom';

const ipcRenderer = window.electron.ipcRenderer;

const Settings = () => {
    const { selectedPrinter, setSelectedPrinter, printers } =
        useContext(LoginContext);

    const handleChange = useCallback(
        (field: string, value: any) => {
            ipcRenderer.invoke('setSelectedPrinters', {
                ...selectedPrinter,
                [field]: value.value,
            });
            setSelectedPrinter({ ...selectedPrinter, [field]: value.value });
        },
        [selectedPrinter]
    );

    const getItemValue = useCallback(
        (label: string) => {
            return printers.find((item: any) => item.label === label)
                ? { label, value: label }
                : false;
        },
        [printers]
    );
    const scaleOption = [
        {
            label: "Empty scale",
            value: ""
        },
        {
            label: "noscale",
            value: "noscale"
        },
        {
            label: "shrink",
            value: "shrink"
        },
        {
            label: "fit",
            value: "fit"
        },
    ]
    const getScaleValue = useCallback((label: string) => {
        return scaleOption.find((item: any) => item.value === label)
            ? scaleOption.find((item: any) => item.value === label)
            : false;
    }, [scaleOption])

    const options = useMemo(() => {
        return printers.map((item: any) => ({
            label: item.label,
            value: item.label,
        }));
    }, [printers]);



    return (
        <ErrorBoundary>
            <Navbar />
            <h2 className="text-center">Select Printers</h2>
            <Link to="/print" className='m-4'>
                <button className="btn btn-secondary"><i className="fa fa-arrow-left"></i> Back to print</button>
            </Link>
            <div className="w-50 p-4">
                <label htmlFor="boxPrinter" className="h5">
                    Box label printer
                </label>
                <Select
                    value={getItemValue(selectedPrinter.boxPrinter)}
                    id="boxPrinter"
                    className="my-2"
                    placeholder="Select scale"
                    onChange={(val) => handleChange('boxPrinter', val)}
                    options={options}
                />
            </div>
            <div className='d-flex'>
                <div className="p-4 w-100">
                    <label htmlFor="labelPrinter" className="h5">
                        Item label printer
                    </label>
                    <Select
                        value={getItemValue(selectedPrinter.labelPrinter)}
                        id="labelPrinter"
                        className="my-2"
                        onChange={(val) => handleChange('labelPrinter', val)}
                        options={options}
                    />
                </div>
                <div className="p-4 w-100">
                    <label htmlFor="scale" className="h5">
                        Item label scale
                    </label>
                    <Select
                        value={getScaleValue(selectedPrinter.scale)}
                        id="scale"
                        className="my-2"
                        onChange={(val) => handleChange('scale', val)}
                        options={scaleOption}
                    />
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default Settings;
