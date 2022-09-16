import { ipcMain } from 'electron';
import fs from 'fs';
import { downloadFile } from './download';
import { print, getPrinters, Printer, PrintOptions } from 'pdf-to-printer';
import Store from './store';
import { captureException } from '@sentry/electron/main';

const store = new Store({
    configName: 'userInfo',
});

ipcMain.handle('download', async (event, arg) => {
    try {
        const data = arg.file;
        const DownloadUrl = data;
        return downloadFile(DownloadUrl);
    } catch (err) {
        captureException(err);
        return false;
    }
});

ipcMain.handle('printPdf', async (event, org) => {
    console.log(org);
    try {
        const { path, printerOption } = org;
        await print(path, printerOption);
        return true;
    } catch (error: any) {
        console.log(error);
        captureException(error);
        return false;
    }
});

ipcMain.handle('getPrinters', async (event, org) => {
    try {
        const fetchPrinter = await getPrinters();
        return fetchPrinter.map((data: Printer, idx: number) => ({
            value: idx.toString(),
            label: data.name,
        }));
    } catch (error: any) {
        captureException(error);
        return [];
    }
});

ipcMain.handle('getLoginDetails', (event, arg) => {
    let credentials = store.get('credentials');
    return credentials;
});

ipcMain.on('setCredentials', (event, arg) => {
    store.set('credentials', arg);
});

ipcMain.on('setLastPrinter', (event, arg) => {
    store.set('lastPrinter', arg);
});
ipcMain.handle('getLastPrinter', (event, arg) => {
    let printer = store.get('lastPrinter');
    return printer;
});

/* DELETE FOLDERS */
ipcMain.handle('deleteFolder', async (event, arg) => {
    try {
        if (fs.existsSync('src/assets')) {
            fs.rmdir('src/assets', { recursive: true }, (err) => {
                if (err) {
                    throw err;
                }
            });
        }
    } catch (error) {
        console.log('error while folder delete');
    }
});

/* SELECTED PRINTERS */
ipcMain.handle('setSelectedPrinters', async (event, arg) => {
    store.set('selectedPrinters', arg);
});

ipcMain.handle('getSelectedPrinters', async (event, arg) => {
    return store.get('selectedPrinters');
});
