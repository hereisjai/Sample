// component 

// FileUploadComponent.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadFiles } from './actions';

interface RootState {
  fileStatus: {
    fileStatus: {
      [fileId: string]: {
        status: string;
        progress?: number;
        response?: any;
        error?: Error;
      };
    };
  };
  uploadStatus: {
    error: Error | null;
  };
}

const FileUploadComponent: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const dispatch = useDispatch();
  const fileStatus = useSelector((state: RootState) => state.fileStatus);
  const uploadStatus = useSelector((state: RootState) => state.uploadStatus);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    setSelectedFiles([...selectedFiles, ...(files ? Array.from(files) : [])]);
  };

  const handleUpload = () => {
    dispatch(uploadFiles(selectedFiles));
    setSelectedFiles([]);
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileSelection} />
      <button onClick={handleUpload}>Upload</button>

      {selectedFiles.map((file) => (
        <div key={file.id}>
          <p>Filename: {file.name}</p>
          <p>Size: {file.size} bytes</p>

          {fileStatus[file.id] && fileStatus[file.id].status === 'UPLOADING' && (
            <div>Uploading... {fileStatus[file.id].progress}%</div>
          )}

          {fileStatus[file.id] && fileStatus[file.id].status === 'SUCCESS' && (
            <div>Upload successful</div>
          )}

          {fileStatus[file.id] && fileStatus[file.id].status === 'FAILURE' && (
            <div>Upload failed: {fileStatus[file.id].error!.message}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileUploadComponent;




// reducer.ts
import {
  UPLOAD_FILES,
  UPLOAD_SUCCESS,
  UPLOAD_FAILURE,
  UPLOAD_PROGRESS,
} from './actionTypes';

interface FileStatus {
  [fileId: string]: {
    status: string;
    progress?: number;
    response?: any;
    error?: Error;
  };
}

interface FileUploadState {
  fileStatus: FileStatus;
  error: Error | null;
}

interface FileUploadAction {
  type: string;
  fileId?: string;
  progress?: number;
  response?: any;
  error?: Error;
}

const initialState: FileUploadState = {
  fileStatus: {},
  error: null,
};

const reducer = (state = initialState, action: FileUploadAction): FileUploadState => {
  switch (action.type) {
    case UPLOAD_FILES:
      return {
        ...state,
        fileStatus: {},
        error: null,
      };
    case UPLOAD_PROGRESS:
      return {
        ...state,
        fileStatus: {
          ...state.fileStatus,
          [action.fileId!]: {
            ...state.fileStatus[action.fileId!],
            progress: action.progress!,
          },
        },
        error: null,
      };
    case UPLOAD_SUCCESS:
      return {
        ...state,
        fileStatus: {
          ...state.fileStatus,
          [action.fileId!]: {
            ...state.fileStatus[action.fileId!],
            status: 'SUCCESS',
            response: action.response,
          },
        },
        error: null,
      };
    case UPLOAD_FAILURE:
      return {
        ...state,
        fileStatus: {
          ...state.fileStatus,
          [action.fileId!]: {
            ...state.fileStatus[action.fileId!],
            status: 'FAILURE',
            error: action.error,
          },
        },
        error: action.error,
      };
    default:
      return state;
  }
};

export default reducer;



//action

// actions.ts
import axios from 'axios';
import {
  UPLOAD_FILES,
  UPLOAD_SUCCESS,
  UPLOAD_FAILURE,
  UPLOAD_PROGRESS,
} from './actionTypes';

interface FileUploadAction {
  type: string;
  fileId?: string;
  progress?: number;
  response?: any;
  error?: Error;
}

export const uploadFiles = (files: File[]) => {
  return async (dispatch: (action: FileUploadAction) => void) => {
    dispatch({ type: UPLOAD_FILES });

    try {
      for (const file of files) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error(`File size exceeds the maximum limit of ${maxSize} bytes.`);
        }

        const allowedFormats = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedFormats.includes(file.type)) {
          throw new Error('Invalid file format. Only JPEG, PNG, and GIF files are allowed.');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            dispatch({ type: UPLOAD_PROGRESS, fileId: file.id, progress });
          },
        });

        dispatch({ type: UPLOAD_SUCCESS, fileId: file.id, response });
      }
    } catch (error) {
      dispatch({ type: UPLOAD_FAILURE, error });
    }
  };
};
