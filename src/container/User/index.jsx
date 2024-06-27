import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell, Modal, Input, Button, Toast, FilePicker } from 'zarm';
import { get, post, imgUrlTrans } from '@/utils';

import s from './style.module.less';

const User = () => {
  const navigateTo = useNavigate();
  const [user, setUser] = useState({});
  const [signature, setSignature] = useState('');
  const [show, setShow] = useState(false);
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    getUserInfo();
  }, []);

  // 获取用户信息
  const getUserInfo = async () => {
    const { data } = await get('/api/user/get_userinfo');
    setUser(data);
    setAvatar(imgUrlTrans(data.avatar))
    setSignature(data.signature)
  };

  // 个性签名弹窗确认
  const confirmSig = async () => {
    const { data } = await post('/api/user/edit_signature', {
      signature: signature
    });
    setUser(data);
    setShow(false);
    Toast.show('修改成功');
  } ;

  // 退出登录
  const logout = async () => {
    localStorage.removeItem('token');
    navigateTo('/login');
  };

  return <div className={s.user}>
    <div className={s.head}>
      <div className={s.info}>
        <span>柜子信息</span>
        <span>
          <b>柜子地址信息：{ user.signature || '待输入' }</b>
        </span>
      </div>
   </div>
   <div className={s.content}>
    <Cell
      hasArrow
      title="柜子信息修改"
      onClick={() => navigateTo('/userinfo')}
      icon={<img style={{ width: 20, verticalAlign: '-7px' }} src="//s.yezgea02.com/1615974766264/gxqm.png" alt="" />}
    />
    <Cell
      hasArrow
      title="重制密码"
      onClick={() => navigateTo('/account')}
      icon={<img style={{ width: 20, verticalAlign: '-7px' }} src="//s.yezgea02.com/1615974766264/zhaq.png" alt="" />}
    />
    {/* <Cell
      hasArrow
      title="我的标签"
      icon={<img style={{ width: 20, verticalAlign: '-7px' }} src="//s.yezgea02.com/1619321650235/mytag.png" alt="" />}
    /> */}
    {/* <Cell
      hasArrow
      title="关于我们"
      onClick={() => navigateTo('/about')}
      icon={<img style={{ width: 20, verticalAlign: '-7px' }} src="//s.yezgea02.com/1615975178434/lianxi.png" alt="" />}
    /> */}
   </div>
   <Button className={s.logout} block theme="danger" onClick={logout}>退出当前柜子</Button>
   <Modal
      visible={show}
      title="标题"
      closable
      onCancel={() => setShow(false)}
      footer={
        <Button block theme="primary" onClick={confirmSig}>
          确认
        </Button>
      }
    >
    <Input
        autoHeight
        showLength
        maxLength={50}
        type="text"
        rows={3}
        value={signature}
        placeholder="请输入领用人信息"
        onChange={(val) => setSignature(val)}
        />
    </Modal>
  </div>
};

export default User;