import * as RNFS from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { zip } from 'react-native-zip-archive'
import sanitize from 'sanitize-filename';
import { Pic, CaseExistsError } from '../types/interfaces';


// const PICS_FOLDER = `${RNFU.PicturesDirectoryPath}/casepics`
const PICS_FOLDER = "/storage/emulated/0/Pictures/casepics"

const getPics = async (caseName: string): Promise<Pic[]> => {
    let caseFolder = `${PICS_FOLDER}/${caseName}`;
    await prepareFolder(caseFolder);
    let files = await RNFS.readDir(caseFolder)
    files = files.filter((file) => file.isFile() && (file.name.endsWith(".jpg") || file.name.endsWith(".png")))
    const promises = files.map(async file => {

        return {
            name: file.name.replace(/\.[^/.]+$/, ""),
            // source: "file://" + file.path + "#" + Math.random()
            path: file.path,
            timestamp: (await getCTime(file.path)),
            caseName: caseName
        }
    })
    return Promise.all(promises);
}

const getCaseFiles = async (caseName: string): Promise<string[]> => {
    let caseFolder = `${PICS_FOLDER}/${caseName}`;
    await prepareFolder(caseFolder);
    let files = await RNFS.readDir(caseFolder);
    return files.map(file => "file://" + file.path + "#" + Math.random());
}

const clearFolder = async (caseName: string): Promise<void> => {
    let caseFolder = `${PICS_FOLDER}/${caseName}`;
    let files = await RNFS.readDir(caseFolder)
    files.forEach(async (file) => {
        await RNFS.unlink(file.path)
    });
}

const deletePicture = async (pic: Pic): Promise<void> => {
    const caseFolder = `${PICS_FOLDER}/${pic.caseName}`;
    // const picPath = `${caseFolder}/${pic.a}.jpg`
    const notePath = `${caseFolder}/${pic.name}.txt`
    await RNFS.unlink(pic.path)
    if (await RNFS.exists(notePath)) {
        await RNFS.unlink(notePath)
    }

}


async function renamePicture(pic: Pic, newName: string): Promise<Pic> {
    newName = sanitize(newName);
    const caseFolder = `${PICS_FOLDER}/${pic.caseName}`;
    // const oldPicPath = `${caseFolder}/${p}.jpg`
    const oldNotePath = `${caseFolder}/${pic.name}.txt`
    const newPicPath = `${caseFolder}/${newName}.jpg`
    const newNotePath = `${caseFolder}/${newName}.txt`
    await RNFS.moveFile(pic.path, newPicPath);
    if (await RNFS.exists(oldNotePath)) {
        await RNFS.moveFile(oldNotePath, newNotePath);
    }
    pic.name = newName;
    pic.path = newPicPath;
    return pic;
}

async function getCTime(path: string): Promise<number> {
    const info = await RNFS.stat(path);
    return info.ctime.getTime();
}

async function savePicture(tempPath: string, name: string, caseName: string): Promise<Pic> {
    name = sanitize(name);
    let caseFolder = `${PICS_FOLDER}/${caseName}`;
    await prepareFolder(caseFolder);
    let newName = name
    let fullName = `${newName}.jpg`
    let destPath = `${caseFolder}/${fullName}`
    let i = 1
    while (await RNFS.exists(destPath)) {
        newName = `${name}_${i}`
        fullName = `${newName}.jpg`
        destPath = `${caseFolder}/${fullName}`;
        i++
    }

    if (tempPath.startsWith("file://")) {
        tempPath = tempPath.replace("file://", "");
    }
    await RNFS.moveFile(tempPath, destPath)
    const ctime = await getCTime(destPath);
    return {
        name: newName,
        path: destPath,
        caseName: caseName,
        timestamp: ctime
    } as Pic
}

const permissionWriteExternalStorage = async (): Promise<boolean> => {
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    )
    return granted === PermissionsAndroid.RESULTS.GRANTED
}

const prepareFolder = async (folder?: string): Promise<void> => {
    if (folder !== undefined) {
        const exists = await RNFS.exists(folder)
        if (!exists) {
            const perm = await permissionWriteExternalStorage();
            if (perm) {
                await RNFS.mkdir(folder);
            }

        }
        return
    }
    //Case folder not provided check the main folder
    const exists = await RNFS.exists(PICS_FOLDER)
    if (!exists) {
        const perm = await permissionWriteExternalStorage();
        if (perm) {
            await RNFS.mkdir(PICS_FOLDER);
        }

    }

}


const getCases = async (): Promise<string[]> => {
    await prepareFolder();
    let entries = await RNFS.readDir(PICS_FOLDER);
    entries = entries.filter((entry) => entry.isDirectory());
    return entries.map(entry => {
        return entry.name
    })

}

const createCase = async (name: string): Promise<string> => {
    name = sanitize(name);
    const path = `${PICS_FOLDER}/${name}`;
    const exists = await RNFS.exists(path);
    if (exists) {
        throw new CaseExistsError("Case already exists");
    }
    const perm = await permissionWriteExternalStorage();
    if (perm) {
        await RNFS.mkdir(path);;
    }
    return name;
}

const deleteCase = async (name: string): Promise<void> => {
    const path = `${PICS_FOLDER}/${name}`;
    const exists = await RNFS.exists(path);
    if (exists) {
        await RNFS.unlink(path);
    }
    try {
        await AsyncStorage.removeItem(name);
    } catch (e) {
        console.log(e);
    }
}

const renameCase = async (oldName: string, newName: string): Promise<string> => {
    const oldPath = `${PICS_FOLDER}/${oldName}`;
    const newPath = `${PICS_FOLDER}/${newName}`;
    const exists = await RNFS.exists(oldPath);
    if (exists) {
        await RNFS.moveFile(oldPath, newPath)
    }
    return newName;
}

const saveNote = async (pic: Pic, text: string): Promise<void> => {
    const path = `${PICS_FOLDER}/${pic.caseName}/${pic.name}.txt`;
    console.log(text)
    text = text.trim();
    console.log(text)
    if (text == "") {
        const exists = await RNFS.exists(path);
        if (exists) {
            await RNFS.unlink(path);
        }
        return
    }
    RNFS.writeFile(path, text, 'utf8')
}

const getNote = async (pic: Pic): Promise<string> => {
    const path = `${PICS_FOLDER}/${pic.caseName}/${pic.name}.txt`;
    const exists = await RNFS.exists(path);
    if (exists) {
        return await RNFS.readFile(path, 'utf8');
    }
    return ""
}

const saveLastObjectName = async (caseName: string, value: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(caseName, value);
    } catch (e) {
        console.log(e);
    }
}

const getLastObjectName = async (caseName: string): Promise<string> => {
    try {
        const value = await AsyncStorage.getItem(caseName)
        if (value !== null) {
            return value;
        } else {
            return ""
        }
    } catch (e) {
        console.log(e);
    }
    return ""
}

const zipCase = async (caseName: string): Promise<string> => {
    const caseFolder = `${PICS_FOLDER}/${caseName}`;
    const tempDir = `/storage/emulated/0/Pictures/casepics_temp`;
    const exists = await RNFS.exists(tempDir);
    if (exists) {
        await RNFS.unlink(tempDir);
    }
    await RNFS.mkdir(tempDir);
    const tempFile = `${tempDir}/${caseName}.zip`;
    const path = zip(caseFolder, tempFile);
    return path;
}


export {
    savePicture,
    PICS_FOLDER,
    getPics,
    clearFolder,
    deletePicture,
    renamePicture,
    prepareFolder,
    getCases,
    deleteCase,
    createCase,
    renameCase,
    saveNote,
    getNote,
    saveLastObjectName,
    getLastObjectName,
    zipCase,
    getCaseFiles,
    getCTime
}