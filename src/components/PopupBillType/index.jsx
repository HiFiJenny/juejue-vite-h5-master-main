import React, { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Popup, Icon } from 'zarm';
import cx from 'classnames';
import { get } from '@/utils';

import s from './style.module.less';

const PopupBillType = forwardRef(({ onSelect, payType }, ref) => {  
  const [show, setShow] = useState(false);  
  const [expense, setExpense] = useState([]); // 支出类型数组  
  const [income, setIncome] = useState([]); // 收入类型数组  
  
  useEffect(() => {  
    (async () => {
      const { data: { list } } = await get('/api/type/list');  
      const _expense = list.filter(i => i.type == 1); // 支出类型  
      const _income = list.filter(i => i.type == 2); // 收入类型  
      setExpense(_expense);  
      setIncome(_income);
    })();  
  }, []);  
  
  const selectType = (type) => {  
    setShow(false);  
    onSelect(type);  
  };  
  
  if (ref) {  
    ref.current = {  
      show: () => {  
        setShow(true);  
      },  
      close: () => {  
        setShow(false);  
      }
    };  
  }  
  
  return (
    <Popup  
      visible={show}  
      direction="bottom"  
      onMaskClick={() => setShow(false)}  
      destroy={false}  
      mountContainer={() => document.body}  
    >  
      <div className={s.popupType}>
        <div className={s.header}>
          请选择危化品        
          <Icon type="wrong" className={s.cross} onClick={() => setShow(false)} />
        </div>
        <div className={s.content}>
          <div className={s.grid}>  
            {(payType === 'expense' ? expense : income).map(item => (
              <div 
                key={item.id} 
                onClick={() => selectType(item)} 
                className={s.item}
              >  
                <span>{item.name}</span>  
              </div>  
            ))} 
          </div>
        </div>
      </div>
    </Popup>  
  );
});  
  
PopupBillType.propTypes = {  
  onSelect: PropTypes.func.isRequired, // 选择后的回调  
  payType: PropTypes.string.isRequired, // 账单类型  
};  
  
export default PopupBillType;
