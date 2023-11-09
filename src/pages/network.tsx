import { invoke } from "@tauri-apps/api";
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Space,
  Typography,
  Input,
} from "antd";
import { useEffect, useState } from "react";
import {
  SyncOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Paragraph } = Typography;

interface ModifyDnsState {
  open: boolean;
  data: string;
}

const NetWorkTools = () => {
  const [modifyDnsForm] = Form.useForm()
  const [ip, setIp] = useState<string>("");
  const [dnsList, setDnsList] = useState<Array<string>>([]);
  const [modifyDnsState, setModifyDnsState] = useState<ModifyDnsState>({
    open: false,
    data: "",
  });

  const getAndSetIp = () => {
    invoke("get_local_ip").then((res: any) => {
      setIp(res);
    });
  };

  const getAndSetDns = () => {
    invoke("get_dns").then((res: any) => {
      if (res) {
        setDnsList(res.split(/[\n,]/g));
      }
    });
  };

  const getDnsListFormInitValues = (dnsData:Array<string>) => {
    return dnsData.map((dns) => {
      const paraseDnsData = dns.split('.')
      return {
        0:paraseDnsData[0],
        1:paraseDnsData[1],
        2:paraseDnsData[2],
        3:paraseDnsData[3],
      }
    })
  }

  const modifyDnsModalOnCancel = () => {
    setModifyDnsState((pre) => {
      return {...pre,open:false}
    })
  }

  const modifyDnsModalOnOk = () => {
    modifyDnsForm.validateFields().then((values) => {
      const dns = values.dnsList.map((dns:any) => {
        return `${dns[0]}.${dns[1]}.${dns[2]}.${dns[3]}`
      })
      invoke("set_dns",{servers:dns}).then(() => {
        modifyDnsModalOnCancel()
        getAndSetDns()
      })
    })
  }

  useEffect(() => {
    getAndSetIp();
    getAndSetDns();
  }, []);

  return (
    <Card style={{ width: "100%", height: "100%", overflow: "auto" }}>
      <Row gutter={16}>
        <Col span={12}>
          <Card
            bodyStyle={{height:150,overflow:'auto'}}
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
                    Refresh IP
                  </Button>
                </Space>
              </div>
            }
          >
            <Paragraph copyable>{ip}</Paragraph>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            bodyStyle={{height:150,overflow:'auto'}}
            title={
              <div>
                <Space>
                  <span>DNS Information</span>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      setModifyDnsState((pre) => {
                        return {...pre,open:true}
                      })
                    }}
                  >
                    Modify DNS
                  </Button>
                </Space>
              </div>
            }
          >
            {
              dnsList.map(dns => {
                return  <Paragraph copyable>{dns}</Paragraph>
              })
            }
          </Card>
        </Col>
        <Modal
          onCancel={modifyDnsModalOnCancel}
          destroyOnClose
          open={modifyDnsState.open}
          onOk={modifyDnsModalOnOk}
          title="Modify DNS"
        >
          <Form
            form={modifyDnsForm}
            style={{ maxWidth: 600 }}
            autoComplete="off"
          >
            <Form.List name="dnsList" initialValue={getDnsListFormInitValues(dnsList)}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "0"]}
                        rules={[
                          { required: true, message: "Missing" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      .
                      <Form.Item
                        {...restField}
                        name={[name, "1"]}
                        rules={[
                          { required: true, message: "Missing" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      .
                      <Form.Item
                        {...restField}
                        name={[name, "2"]}
                        rules={[
                          { required: true, message: "Missing" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      .
                      <Form.Item
                        {...restField}
                        name={[name, "3"]}
                        rules={[
                          { required: true, message: "Missing" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add DNS
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        </Modal>
      </Row>
    </Card>
  );
};

export default NetWorkTools;
