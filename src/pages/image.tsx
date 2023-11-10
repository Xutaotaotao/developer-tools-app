import { Card, Upload, Row, Col,Menu } from "antd";
import { useTranslation } from "react-i18next";
import type { MenuProps, UploadFile } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useState } from "react";
import { UploadChangeParam } from "antd/es/upload";
import { invoke } from "@tauri-apps/api";

const { Dragger } = Upload;

interface FileItem extends UploadFile {
  dealData?: any;
  originImgBuffer: ArrayBuffer;
}

const items: MenuProps['items'] = [
  {
    label: 'Channel',
    key: 'Channel',
    children: [
      {
        label: 'AlterRedChannel',
        key: 'alter_red_channel',
      },
      {
        label: 'AlterGreenChannel',
        key: 'alter_green_channel',
      },
      {
        label: 'AlterBlueChannel',
        key: 'alter_blue_channel',
      }
    ]
  },
];

const Image = () => {
  const { t } = useTranslation();
  const [fileList, setFileList] = useState<Array<FileItem>>([]);
  const [originalImage, setOriginalImage] = useState("");
  const [dealedImage,setDealedImage] = useState('')
  const [current, setCurrent] = useState('');
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
  const filesChange = (info: UploadChangeParam<UploadFile<any>>) => {
    const hasFile = fileList.find(
      (file: FileItem) => info.file.name === file.name
    );
    if (hasFile) {
      return;
    } else {
      if (info.file.originFileObj) {
        setOriginalImage(URL.createObjectURL(info.file.originFileObj));
        setDealedImage('')
        fileToArrayBuffer(info.file.originFileObj).then(async (res) => {
          if (res) {
            setFileList([
              {
                ...info.file,
                originImgBuffer: res,
              },
            ]);
          }
        });
      }
    }
  };

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
    const pixels = fileList[0].originImgBuffer
    invoke('photo_channel',{
      pixels:Array.from(new Uint8Array(pixels)),
      method:e.key
    }).then((res:any) => {
      if (res) {
        setDealedImage(res)
      }
    })
  };

  return (
    <Card className="layout-card">
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
          {t("Click or drag file to this area to upload")}
        </p>
      </Dragger>
      <Row gutter={16}>
        <Col span={6}>
          <Menu mode="inline" openKeys={['Channel']} onClick={onClick} selectedKeys={[current]} items={items} />
        </Col>
        <Col span={18}>
          <Row gutter={16} style={{ marginTop: 15 }}>
            <Col span={12}>
              {originalImage ? (
                <img
                  style={{ width: "100%", height: "100%" }}
                  src={originalImage}
                />
              ) : (
                ""
              )}
            </Col>
            <Col span={12}>
            {dealedImage ? (
                <img
                  style={{ width: "100%", height: "100%" }}
                  src={dealedImage}
                />
              ) : (
                ""
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default Image;
