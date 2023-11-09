import { InboxOutlined } from "@ant-design/icons";
import {
  Upload,
  Card,
  Typography,
  Button,
  Tag,
  Table,
  Tooltip,
} from "antd";
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import type { ColumnsType } from 'antd/es/table';
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/tauri";
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { path, dialog } from '@tauri-apps/api';


const { Dragger } = Upload;

const { Text } = Typography;

type CompressStatus = "loading" | "success" | "error" | undefined;

interface FileItem extends UploadFile {
  compressSize?: number;
  compressData?: any;
  compressStatus: CompressStatus;
}

interface CompressResult {
  data: Array<any>;
  size: number;
}

const CompressImage = () => {
  const { t } = useTranslation();

  const [fileList, setFileList] = useState<Array<FileItem>>([]);

  const filesChange = (data: any) => {
    const hasFile = fileList.find(
      (file: FileItem) => data.file.name === file.name
    );
    if (hasFile) {
      return;
    } else {
      setFileList((pre: Array<FileItem>) => {
        return pre.concat({
          ...data.file,
          compressStatus: "loading",
        });
      });
      fileToArrayBuffer(data.file.originFileObj)
        .then(async (res) => {
          if (res) {
            const compressResult = (await invoke("compress_image", {
              imgBuffer: Array.from(new Uint8Array(res)),
              quality: 10,
            })) as CompressResult;
            setFileList((pre) => {
              const newFileData = pre.map((preFile) => {
                if (preFile.name === data.file.name) {
                  return {
                    ...preFile,
                    compressData: compressResult.data,
                    compressSize: compressResult.size,
                    compressStatus: "success" as const,
                  };
                }
                return preFile;
              });
              return newFileData;
            });
          } else {
            setFileList((pre) => {
              const newFileData = pre.map((preFile) => {
                if (preFile.name === data.file.name) {
                  return {
                    ...preFile,
                    compressStatus: "error" as const,
                  };
                }
                return preFile;
              });
              return newFileData;
            });
          }
        })
        .catch((err) => {
          console.error(err);
          setFileList((pre) => {
            const newFileData = pre.map((preFile) => {
              if (preFile.name === data.file.name) {
                return {
                  ...preFile,
                  compressStatus: "error" as const,
                };
              }
              return preFile;
            });
            return newFileData;
          });
        });
    }
  };

  const fileToArrayBuffer = (file: File): Promise<ArrayBuffer | undefined> => {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          resolve(event.target.result as ArrayBuffer);
        }
        resolve(undefined);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const getCompressProportion = (size: number, compressSize: number) => {
    return (((size - compressSize) / size) * 100).toFixed(2);
  };

  const renderStatus = (compressStatus: CompressStatus) => {
    if (compressStatus === "loading") {
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          processing
        </Tag>
      );
    }
    if (compressStatus === "success") {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          success
        </Tag>
      );
    }
    if (compressStatus === "error") {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          error
        </Tag>
      );
    }
  };

  const handleSaveFile = async (file:FileItem) => {
    const basePath = await path.downloadDir();
    let selPath = await dialog.save({
      defaultPath: basePath,
    });
    if (selPath) {
      selPath = selPath.replace(/Untitled$/, '');
      let fileU8A = new Uint8Array(file.compressData);
      writeBinaryFile({ contents: fileU8A, path: `${selPath}${file.name}` });
    }
  }

  const columns:ColumnsType<FileItem> = [
    {
      title: t('Name'),
      dataIndex: 'name',
      width:180,
      key: 'name',
      ellipsis: true,
      render: (text:string) => {
        return <Tooltip title={text}>
           <Text strong>
              {text}
          </Text>
        </Tooltip>
      }
    },
    {
      title: t('Size'),
      dataIndex: 'size',
      key: 'size',
      render: (size:number) => {
        return <Text type="secondary">{Number(size) / 1000}kb</Text>
      }
    },
    {
      title: t('Compress status'),
      dataIndex: 'compressStatus',
      key: 'compressStatus',
      width:180,
      render: (compressStatus:CompressStatus) => {
        return renderStatus(compressStatus)
      }
    },
    {
      title: t('Compress size'),
      dataIndex: 'compressSize',
      width:180,
      key: 'compressSize',
      render: (_,record) => {
        return record.compressStatus === "success" ? (
          <Text type="success">
            {Number(record.compressSize) / 1000}kb
          </Text>
        ) : (
          "-"
        )
      }
    },
    {
      title: t('Compress proportion'),
      dataIndex: 'compressProportion',
      key: 'compressProportion',
      width:180,
      render: (_,record) => {
        return record.size && record.compressSize  ? (
          <Text type="success">
            {getCompressProportion(record.size,record.compressSize)}%
          </Text>
        ) : (
          "-"
        )
      }
    },
    {
      title: t('Action'),
      dataIndex: 'action',
      key: 'action',
      render: (_,record) => {
        return record.compressStatus === "success" ? (
          <Button type="link" onClick={() => handleSaveFile(record)}>Download</Button>
        ) : (
          "-"
        )
      }
    },
  ]


  return (
    <Card style={{ width: "100%", height: "100%", overflow: "auto" }}>
      <Dragger
        name="file"
        multiple
        onChange={filesChange}
        fileList={fileList}
        customRequest={() => {}}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {t("Click or drag file to this area to compress")}
        </p>
        <p className="ant-upload-hint">
          {/* Support for a single or bulk upload. Strictly prohibited from uploading company data or other
      banned files. */}
        </p>
      </Dragger>
      <Table
        rowKey="name"
        style={{marginTop:20}}
        dataSource={fileList}
        columns={columns}
        pagination={false}
      >
      </Table>
    </Card>
  );
};

export default CompressImage;
