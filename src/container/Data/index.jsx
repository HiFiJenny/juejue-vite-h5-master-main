import React, { useEffect, useState, useRef } from 'react';  
import { Icon, Pull } from 'zarm';  
import dayjs from 'dayjs';  
import BillItem from '@/components/BillItem';  
import Empty from '@/components/Empty';  
import CustomIcon from '@/components/CustomIcon';  
import { get, REFRESH_STATE, LOAD_STATE } from '@/utils';  
import s from './style.module.less';  

const Data = () => {  
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));  
  const [chemicalList, setChemicalList] = useState([]);  
  const [searchTerm, setSearchTerm] = useState('');  
  
  useEffect(() => {  
    getData(searchTerm);  
  }, [currentMonth, searchTerm]);  
  
  const getData = async (searchTerm) => {  
    const { data } = await get(`/api/bill/data?date=${currentMonth}`);  
    let chemicalData = {};  
    data.total_data.forEach(item => {  
      if (!(item.type_id in chemicalData)) {  
        chemicalData[item.type_id] = 0;  
      }  
      if (item.pay_type == 1) {  
        chemicalData[item.type_id] -= item.amount;  
      } else if (item.pay_type == 2) {  
        chemicalData[item.type_id] += item.amount;  
      }  
    });  
    chemicalData = Object.entries(chemicalData).map(([name, remainingAmount]) => ({  
      name,  
      remainingAmount,  
    }));  
    if (searchTerm) {  
      chemicalData = chemicalData.filter(chemical =>   
        chemical.name.toLowerCase().includes(searchTerm.toLowerCase())  
      );  
    }  
    setChemicalList(chemicalData);  
  };  
  
  const handleSearch = (event) => {  
    setSearchTerm(event.target.value);  
  };  
  
  return (  
    <div className={s.data}>  
      <div className={s.header}>  
        <div className={s.dataWrap}>  
          <span className={s.expense}>危化品当前库存</span>  
        </div>  
        <div className={s.searchArea}>  
          <input type="text" placeholder="搜索化学品" value={searchTerm} onChange={handleSearch} />  
          <button onClick={handleSearch}>确认</button>  
        </div>  
      </div>  
      <div className={s.content} style={{ marginTop: '200px' }}> 
        <table>  
          <thead>  
            <tr>  
              <th>化学品名称</th>  
              <th>剩余量</th>  
            </tr>  
          </thead>  
          <tbody>  
            {chemicalList.map((chemical, index) => (  
              <tr key={index}>  
                <td>{chemical.name}</td>  
                <td>{chemical.remainingAmount}</td>  
              </tr>  
            ))}  
          </tbody>  
        </table>  
      </div>  
    </div>  
  );  
};  
  
export default Data;  