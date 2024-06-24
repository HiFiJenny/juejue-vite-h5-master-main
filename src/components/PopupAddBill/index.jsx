import React, { forwardRef, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Popup, Icon, Toast, Keyboard, Modal, Input  } from 'zarm';
import cx from 'classnames'
import dayjs from 'dayjs'; 
import CustomIcon from '../CustomIcon'
import PopupType from '../PopupType'
import PopupDate from '../PopupDate'
import { get, typeMap, post } from '@/utils'//
import { useNavigate } from 'react-router-dom'///////////
import s from './style.module.less';

const PopupAddBill = forwardRef(({ detail = {}, onReload }, ref) => {
  const dateRef = useRef()
  const typeRef = useRef(); // 账单类型 ref//////////////////////////////////////////////////////
  const [currentSelect, setCurrentSelect] = useState({}); // 当前筛选类型///////////////////////////////////////////
  const [unit, setUnit] = useState('ml'); // Default unit

  const id = detail && detail.id // 外部传进来的账单详情 id
  const [show, setShow] = useState(false);
  const [payType, setPayType] = useState('expense'); // 出库或入库类型
  const [expense, setExpense] = useState([]); // 出库类型数组
  const [income, setIncome] = useState([]); // 入库类型数组
  const [currentType, setCurrentType] = useState({});
  const [amount, setAmount] = useState(''); // 账单价格
  const [remark, setRemark] = useState(''); // 备注
  const [showRemark, setShowRemark] = useState(false); // 备注输入框
  const [date, setDate] = useState(new Date()); // 日期
  const navigateTo = useNavigate(); // 路由实例///////////////////////////////////
  // const [refreshing, setRefreshing] = useState(REFRESH_STATE.normal); // 下拉刷新状态///////////////////////////////

  // const [show, setShow] = useState(false);
  const [active, setActive] = useState('all');
  // const [expense, setExpense] = useState([]);
  // const [income, setIncome] = useState([]);

  useEffect(() => {
    if (detail.id) {
      setPayType(detail.pay_type == 1 ? 'expense' : 'income')
      setCurrentType({
        id: detail.type_id,
        name: detail.type_name
      })
      setRemark(detail.remark)
      setAmount(detail.amount)
      setDate(dayjs(Number(detail.date)).$d)
    }
  }, [detail])

  if (ref) {
    ref.current = {
      show: () => {
        setShow(true);
      },
      close: () => {
        setShow(false);
      }
    }
  };

  useEffect(() => {
    getList()
  }, []);

  const getList = async () => {
    const { data: { list } } = await get('/api/type/list');
    const _expense = list.filter(i => i.type == 1); // 出库类型
    const _income = list.filter(i => i.type == 2); // 入库类型
    setExpense(_expense);
    setIncome(_income);
      // 没有 id 的情况下，说明是新建账单。
    if (!id) {
      setCurrentType(_expense[0]);
    };
  }

  // 切换入库还是出库
  const changeType = (type) => {
    setPayType(type);
    // 切换之后，默认给相应类型的第一个值
    if (type == 'expense') {
      setCurrentType(expense[0]);
    } else {
      setCurrentType(income[0]);
    }
  };

  // 日期弹窗
  const handleDatePop = () => {
    dateRef.current && dateRef.current.show()
  }
  const handleTypeSelect = () => {
    typeRef.current && typeRef.current.show(); // Show the popup for type selection
  };
  
  // 筛选类型/////////////////////////////////////////////这里现在是改成页面的，应该是跳转
  const select = (item) => {
    // setRefreshing(REFRESH_STATE.loading);
    // 触发刷新列表，将分页重制为 1
    // setPage(1);
    setCurrentSelect(item)
    return
  }
  // 日期选择回调
  const selectDate = (val) => {
    setDate(val)
  }

  // 选择账单类型
  const selectType = (item) => {
    setCurrentSelect(item);
  };
  // 监听输入框改变值
  const handleMoney = (value) => {
    value = String(value)
    if (value == 'close') return 
    // 点击是删除按钮时
    if (value == 'delete') {
      let _amount = amount.slice(0, amount.length - 1)
      setAmount(_amount)
      return
    }
    // 点击确认按钮时
    if (value == 'ok') {
      if ( payType == 'expense') {
        goToDetail()
      }///////////////////////memory leak ////////////////////////////
      addBill()
      return
    }
    // 当输入的值为 '.' 且 已经存在 '.'，则不让其继续字符串相加。
    if (value == '.' && amount.includes('.')) return
    // 小数点后保留两位，当超过两位时，不让其字符串继续相加。
    if (value != '.' && amount.includes('.') && amount && amount.split('.')[1].length >= 2) return
    // amount += value
    setAmount(amount + value)
  }
  
  // Function to handle unit change
  const handleUnitChange = (selectedUnit) => {
    setUnit(selectedUnit);
  };

  // 添加账单
  const addBill = async () => {
    if (!amount) {
      Toast.show('请输入具体数量')
      return
    }
    // Adjust parameter to combine amount with unit
    const combinedAmount = `${amount} ${unit}`;
    const params = {
      amount: combinedAmount,
    //   // Other parameters
    //     };
    // const params = {
    //   amount: Number(amount).toFixed(),
      type_id: currentType.id,
      type_name: currentType.name,
      date: dayjs(date).unix() * 1000,
      pay_type: payType == 'expense' ? 1 : 2,
      remark: remark || ''
    }
    if (id) {
      params.id = id;
      // 如果有 id 需要调用详情更新接口
      const result = await post('/api/bill/update', params);
      Toast.show('修改成功');
    } else {
      const result = await post('/api/bill/add', params);
      setAmount('');
      setPayType('expense');
      setCurrentType(expense[0]);
      setDate(new Date());
      setRemark('');
      Toast.show('添加成功');
    }
    setShow(false);
    if (onReload) onReload();
  }

  // New dropdown component for unit selection
  const UnitDropdown = () => (
    <select value={unit} onChange={(e) => handleUnitChange(e.target.value)} className={s.unitSelect}>
      <option value="g">g</option>
      <option value="ml">ml</option>
    </select>
  );


  const goToDetail = () => {
    Modal.alert({
      title: '提示',
      content: '出库前，请领用人仔细阅读MSDS，了解产品危害、安全处理及紧急情况处理手段',
    });
  }
  //   console.log('detail.id:', detail.id);
  //   console.log('detail.type_id:', detail.type_id); // Debugging the value of currentType.id
  //   /////////////////////////////
  //   switch (currentType.id) { // 假设类型在 currentType.id 中 
  //     case '1':  
  //       navigateTo(`about`)  
  //       break  

  //     case '2':  
  //       navigateTo('/about')  
  //       break  

  //     case '3':  
  //       navigateTo('/about')  
  //       break  
        
  //     case '4':  
  //       navigateTo('/about')  
  //       break  
      
  //     case '5':  
  //       navigateTo('/about')  
  //       break  

  //     case '6':  
  //       navigateTo('/about')  
  //       break  
        
  //     case '7':  
  //       navigateTo('/about')  
  //       break  
      
  //     case '8':  
  //       navigateTo('/about')  
  //       break  

  //     case '9':  
  //       navigateTo('/about')  
  //       break  

  //     case '10':  
  //       navigateTo('/about')  
  //       break  

  //     case '11':  
  //       navigateTo('/about')  
  //       break  

  //     case '12':  
  //       navigateTo('about')  
  //       break  
        

  //     // 其他类型
  //     default: 
  //       window.open('https://www.baidu.com', '_blank');

  //       // navigateTo('www.baidu.com') 
  //       break  
  //   }  
  //   // navigateTo(`about`)
    
  //   // navigateTo(`/detail?id=${item.id}`)
  // };

  return <Popup
    visible={show}
    direction="bottom"
    onMaskClick={() => setShow(false)}
    destroy={false}
    mountContainer={() => document.body}
  >
    <div className={s.addWrap}>
      <header className={s.header}>
        <span className={s.close} onClick={() => setShow(false)}><Icon type="wrong" /></span>
      </header>
      <div className={s.filter}>
        <div className={s.type}>
          <span onClick={() => changeType('expense')} className={cx({ [s.expense]: true, [s.active]: payType == 'expense' })}>出库</span>
          <span onClick={() => changeType('income')} className={cx({ [s.income]: true, [s.active]: payType == 'income' })}>入库</span>
          
        </div>
        <div className={s.time} onClick={handleDatePop}>{dayjs(date).format('MM-DD')} <Icon className={s.arrow} type="arrow-bottom" /></div>
        <div className={s.type} onClick={handleTypeSelect}>
          <span className={s.time}>{currentSelect.name || '选择化学品'} <Icon className={s.arrow} type="arrow-bottom" /></span>
        </div>

        {/* <div className={s.time} onClick={choseType2(item)}> <Icon className={s.arrow} type="arrow-bottom" />选择化学品111</div> */}
      </div>
      <div className={s.money}>
        <span className={s.sufix}></span>
        <span className={cx(s.amount, s.animation)}>{amount}</span>
        <UnitDropdown /> {/* Adding the dropdown for unit selection */}

      </div>

      <div className={s.remark}>
        {
          showRemark ? <Input
            autoHeight
            showLength
            maxLength={50}
            type="text"
            rows={3}
            value={remark}
            placeholder="请输入领用人信息"
            onChange={(val) => setRemark(val)}
            onBlur={() => setShowRemark(false)}
          /> : <span onClick={() => setShowRemark(true)}>{remark || '添加领用人'}</span>
        }
      </div>
      <Keyboard type="price" onKeyClick={(value) => handleMoney(value)} />
      <PopupDate ref={dateRef} onSelect={selectDate} />
      <PopupType ref={typeRef} onSelect={selectType} />
    </div>
  </Popup>
});

PopupAddBill.propTypes = {
  detail: PropTypes.object,
  onReload: PropTypes.func,
  onSelect: PropTypes.func////////////////////////////////////
}



export default PopupAddBill;