import * as RNFS from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { zip } from 'react-native-zip-archive'
import sanitize from 'sanitize-filename';
import { Pic, CaseExistsError } from '../types/interfaces';


// const PICS_FOLDER = `${RNFU.PicturesDirectoryPath}/casepics`
const PICS_FOLDER = "/storage/emulated/0/Pictures/casepics"
const PICS_FOLDER2 = "/storage/emulated/0/Pictures/casepics2"

const genUrlFile = (path: string): string => {
    return "file://" + path + "#" + Math.random();
}

const getPics = async (caseName: string, folder2: boolean): Promise<Pic[]> => {
    let caseFolder = folder2 ? `${PICS_FOLDER2}/${caseName}` : `${PICS_FOLDER}/${caseName}`;
    await prepareFolder(caseFolder);
    let files = await RNFS.readDir(caseFolder)
    files = files.filter((file) => file.isFile() && (file.name.endsWith(".jpg") || file.name.endsWith(".png")))
    const promises = files.map(async file => {

        return {
            name: file.name.replace(/\.[^/.]+$/, ""),
            url: genUrlFile(file.path),
            path: file.path,
            timestamp: (await getCTime(file.path)),
            caseName: caseName
        }
    })
    return Promise.all(promises);
}

const getCaseFiles = async (caseName: string, folder2: boolean): Promise<string[]> => {
    let caseFolder = folder2 ? `${PICS_FOLDER2}/${caseName}` : `${PICS_FOLDER}/${caseName}`;
    await prepareFolder(caseFolder);
    let files = await RNFS.readDir(caseFolder);
    return files.map(file => genUrlFile(file.path));
}

const clearFolder = async (caseName: string, folder2: boolean): Promise<void> => {
    let caseFolder = folder2 ? `${PICS_FOLDER2}/${caseName}` : `${PICS_FOLDER}/${caseName}`;
    let files = await RNFS.readDir(caseFolder)
    files.forEach(async (file) => {
        await RNFS.unlink(file.path)
    });
}

const deletePicture = async (pic: Pic, folder2: boolean): Promise<void> => {
    let caseFolder = folder2 ? `${PICS_FOLDER2}/${pic.caseName}` : `${PICS_FOLDER}/${pic.caseName}`;
    // const picPath = `${caseFolder}/${pic.a}.jpg`
    const notePath = `${caseFolder}/${pic.name}.txt`
    await RNFS.unlink(pic.path)
    if (await RNFS.exists(notePath)) {
        await RNFS.unlink(notePath)
    }

}


async function renamePicture(pic: Pic, newName: string, folder2: boolean): Promise<Pic> {
    newName = sanitize(newName);
    const caseFolder = folder2 ? `${PICS_FOLDER2}/${pic.caseName}` : `${PICS_FOLDER}/${pic.caseName}`;
    const oldNotePath = `${caseFolder}/${pic.name}.txt`
    const newPicPath = `${caseFolder}/${newName}.jpg`
    const newNotePath = `${caseFolder}/${newName}.txt`
    await RNFS.moveFile(pic.path, newPicPath);
    if (await RNFS.exists(oldNotePath)) {
        await RNFS.moveFile(oldNotePath, newNotePath);
    }
    pic.name = newName;
    pic.path = newPicPath;
    pic.url = genUrlFile(newPicPath)
    return pic;
}

async function getCTime(path: string): Promise<number> {
    const info = await RNFS.stat(path);
    return info.ctime.getTime();
}

async function savePicture(tempPath: string, name: string, caseName: string, folder2: boolean): Promise<Pic> {
    name = sanitize(name);
    const caseFolder = folder2 ? `${PICS_FOLDER2}/${caseName}` : `${PICS_FOLDER}/${caseName}`;
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
        url: "file://" + destPath + "#" + Math.random(),
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

const prepareFolder = async (folder: string): Promise<void> => {
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


const getCases = async (folder2: boolean): Promise<string[]> => {
    const folder = folder2 ? PICS_FOLDER2 : PICS_FOLDER;
    await prepareFolder(folder);
    let entries = await RNFS.readDir(folder);
    entries = entries.filter((entry) => entry.isDirectory());
    return entries.map(entry => {
        return entry.name
    })

}

const createCase = async (name: string, folder2: boolean): Promise<string> => {
    const folder = folder2 ? PICS_FOLDER2 : PICS_FOLDER;
    name = sanitize(name);
    const path = `${folder}/${name}`;
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

const deleteCase = async (name: string, folder2: boolean): Promise<void> => {
    const path = folder2 ? `${PICS_FOLDER2}/${name}` : `${PICS_FOLDER}/${name}`;
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

const renameCase = async (oldName: string, newName: string, folder2: boolean): Promise<string> => {
    const folder = folder2 ? PICS_FOLDER2 : PICS_FOLDER;
    const oldPath = `${folder}/${oldName}`;
    const newPath = `${folder}/${newName}`;
    const exists = await RNFS.exists(oldPath);
    if (exists) {
        await RNFS.moveFile(oldPath, newPath)
    }
    return newName;
}

const saveNote = async (pic: Pic, text: string, folder2: boolean): Promise<void> => {
    const folder = folder2 ? PICS_FOLDER2 : PICS_FOLDER;
    const path = `${folder}/${pic.caseName}/${pic.name}.txt`;
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

const getNote = async (pic: Pic, folder2: boolean): Promise<string> => {
    const folder = folder2 ? PICS_FOLDER2 : PICS_FOLDER;
    const path = `${folder}/${pic.caseName}/${pic.name}.txt`;
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

const zipCase = async (caseName: string, folder2: boolean): Promise<string> => {
    const folder = folder2 ? PICS_FOLDER2 : PICS_FOLDER;
    const caseFolder = `${folder}/${caseName}`;
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

const moveCaseFolder = async (caseName: string, folder2: boolean): Promise<void> => {
    const folderFrom = folder2 ? PICS_FOLDER2 : PICS_FOLDER;
    const folderTo = folder2 ? PICS_FOLDER : PICS_FOLDER2;
    const caseFolderFrom = `${folderFrom}/${caseName}`;
    const caseFolderTo = `${folderTo}/${caseName}`;
    const exists = await RNFS.exists(caseFolderTo);
    if (exists) {
        throw new CaseExistsError("Case already exists");
    }
    await RNFS.moveFile(caseFolderFrom, caseFolderTo);
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
    getCTime,
    genUrlFile,
    moveCaseFolder
}