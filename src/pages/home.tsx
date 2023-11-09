import { Card, Typography } from "antd";
import { useTranslation } from "react-i18next";

const { Title } = Typography;



const Home = () => {
  const { t } = useTranslation();

  return (
      <Card className="layout-card">
        <Title style={{ marginTop: 0 }} level={3}>
          👋 {t("Hello")}{t("Welcome to developer tools app")}
        </Title>
      </Card>
  );
};

export default Home;
