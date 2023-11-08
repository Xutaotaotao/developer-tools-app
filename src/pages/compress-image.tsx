import { InboxOutlined } from "@ant-design/icons";
import {
  message,
  Upload,
  Card,
  List,
  Typography,
  Progress,
  Row,
  Col,
  Button,
} from "antd";
import type { UploadFile } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/tauri";

const { Dragger } = Upload;

const { Text } = Typography;

interface FileItem extends UploadFile {
  compressSize?: number;
  compressData?: any;
  compressSizePercentage?: number;
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
      fileToArrayBuffer(data.file.originFileObj).then(async (res) => {
        if (res) {
          const compressResult = (await invoke("compress_image", {
            imgBuffer: Array.from(new Uint8Array(res)),
            quality: 10,
          })) as CompressResult;
          setFileList((pre) => {
            return pre.concat({
              ...data.file,
              compressData: compressResult.data,
              compressSize: compressResult.size,
            });
          });
        }
      }).catch(err => {
        console.error(err)
      })
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
      <List
        itemLayout="horizontal"
        dataSource={fileList}
        renderItem={(item, index) => {
          return (
            <Row gutter={42} style={{ alignItems: "center", paddingTop: 20 }}>
              <Col span={6}>
                <Text ellipsis strong>
                  {item.name}
                </Text>
              </Col>
              <Col span={4}>
                <Text type="secondary">{Number(item.size) / 1000}kb</Text>
              </Col>
              <Col span={4}>
                <Progress percent={30} size="small" />
              </Col>
              <Col span={4}>
                <Text type="success">{Number(item.size) / 1000}kb</Text>
              </Col>
              <Col span={3}>
                <Button type="link">下载</Button>
              </Col>
              <Col span={3}>
                <Text italic>-88%</Text>
              </Col>
            </Row>
          );
        }}
      />
      {/* <img src={`data:image/png;base64,${base64}`} /> */}
    </Card>
  );
};

export default CompressImage;
