import { ArduinoAppFilesService } from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';

import {
  CreateFolder,
  GetFileContent,
  GetFileTree,
  IsDirectory,
  RemoveFile,
  RenameFile,
  RenameFolder,
  WriteFileContent,
} from '../../wailsjs/go/app/App';
import { mapFSNode, mapFSNodeToFlat } from './orchestratorService.mapper';

export const getAppFileTree: ArduinoAppFilesService['getAppFileTree'] =
  async function (id: string) {
    const file = await GetFileTree(id);
    return [mapFSNode(file)];
  };

export const getAppFiles: ArduinoAppFilesService['getAppFiles'] =
  async function (id: string) {
    const fileTree = await GetFileTree(id);

    const flatFiles = mapFSNodeToFlat(fileTree);

    return {
      filesList: flatFiles,
      fileTree: [mapFSNode(fileTree)],
    };
  };

export const getAppFileContent: ArduinoAppFilesService['getAppFileContent'] =
  async function (id: string) {
    return GetFileContent(id);
  };

export const saveAppFile: ArduinoAppFilesService['saveAppFile'] =
  async function (path: string, content: string) {
    return WriteFileContent(path, content);
  };

export const createAppFile: ArduinoAppFilesService['createAppFile'] =
  async function (path: string, content: string = '') {
    return WriteFileContent(path, content);
  };

export const renameAppFile: ArduinoAppFilesService['renameAppFile'] =
  async function (path: string, newName: string, nodeType?: 'file' | 'folder') {
    if (nodeType === 'folder') {
      return RenameFolder(path, newName);
    } else {
      return RenameFile(path, newName);
    }
  };

const directoryCache = new Map<string, boolean>();

export const moveAppFile: ArduinoAppFilesService['moveAppFile'] =
  async function (fromPath: string, toPath: string) {
    // Check cache first
    let isDirectory = directoryCache.get(fromPath);

    if (isDirectory === undefined) {
      try {
        isDirectory = await IsDirectory(fromPath);
        // Cache the result for future use
        directoryCache.set(fromPath, isDirectory);
      } catch (error) {
        console.error('Error determining file type:', error);
      }
    }

    return isDirectory
      ? RenameFolder(fromPath, toPath)
      : RenameFile(fromPath, toPath);
  };

export const removeAppFile: ArduinoAppFilesService['removeAppFile'] =
  async function (path: string) {
    return RemoveFile(path);
  };

export const createAppFolder: ArduinoAppFilesService['createAppFolder'] =
  async function (path: string) {
    return CreateFolder(path);
  };
