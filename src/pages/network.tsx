import { invoke } from "@tauri-apps/api";
import { Button, Card, Col, Row, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import {SyncOutlined} from '@ant-design/icons'; 

const { Paragraph } = Typography;

const NetWorkTools = () => {
  const [ip, setIp] = useState<string>("");
  const [dns,setDns] = useState<string>("")

  const getAndSetIp = () => {
    invoke("get_local_ip").then((res: any) => {
      setIp(res);
    });
  };

  const getAndSetDns = () => {
    invoke("get_dns").then((res: any) => {
      setDns(res);
    });
  };

  useEffect(() => {
    getAndSetIp();
    getAndSetDns();
  }, []);
  

  return (
    <Card style={{ width: "100%", height: "100%", overflow: "auto" }}>
      <Row gutter={16}>
        <Col span={12}>
          <Card
            title={
              <div>
                <Space>
                  <span>IP Information</span>
                  <Button
                    icon={<SyncOutlined />}
                    onClick={() => {
                      getAndSetIp();
                    }}
                  >
                    Refresh
                  </Button>
                </Space>
              </div>
            }
          >
            <Paragraph copyable>{ip}</Paragraph>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="DNS Information">
            <Paragraph copyable>{dns}</Paragraph>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default NetWorkTools;
