import React from 'react';
import { Button, Result } from 'antd';

const ErrorPage: React.FC = () => (
  <div style={{width:'100%',height:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
    <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={<Button onClick={() => {window.history.back()}} type="primary">Back Home</Button>}
  />
  </div>
  
);

export default ErrorPage