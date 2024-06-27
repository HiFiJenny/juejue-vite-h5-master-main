import React, { useEffect, useRef, useState } from 'react';
import { Icon, Progress } from 'zarm';
import cx from 'classnames';
import dayjs from 'dayjs';
import { get, typeMap } from '@/utils'
import CustomIcon from '@/components/CustomIcon'
import PopupDate from '@/components/PopupDate'
import s from './style.module.less';

let proportionChart = null

const  Data = () => {
  const monthRef = useRef();
  const [totalType, setTotalType] = useState('expense');
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [pieType, setPieType] = useState('expense');

  useEffect(() => {
    getData()
    return () => {
      // 每次组件卸载的时候，需要释放图表实例。clear 只是将其清空不会释放。
      proportionChart.dispose();
    }
  }, [currentMonth]);
  
  const getData = async () => {
    const { data } = await get(`/api/bill/data?date=${currentMonth}`);
  
    // 总收支
    setTotalExpense(data.total_expense);
    setTotalIncome(data.total_income);
  
    // 过滤出库和入库
    const expense_data = data.total_data.filter(item => item.pay_type == 1).sort((a, b) => b.number - a.number); // 过滤出账单类型为出库的项
    const income_data = data.total_data.filter(item => item.pay_type == 2).sort((a, b) => b.number - a.number); // 过滤出账单类型为入库的项
    setExpenseData(expense_data);
    setIncomeData(income_data);
    setPieChart(pieType == 'expense' ? expense_data : income_data);
  };
  


  // 绘制饼图方法
  const setPieChart = (data) => {
    if (window.echarts) {
      proportionChart = echarts.init(document.getElementById('proportion'));
      proportionChart.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          // 图例
          legend: {
              data: data.map(item => item.type_name)
          },
          series: [
            {
              name: '出库',
              type: 'pie',
              radius: '55%',
              data: data.map(item => {
                return {
                  value: item.number,
                  name: item.type_name
                }
              }),
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
      })
    }
  }

  const selectMonth = (item) => {
    setCurrentMonth(item)
  }

  return <div className={s.data}>
    <div className={s.structure}>
      <div className={s.head}>
        <span className={s.title}>危化品清单</span>
      </div>
      <div className={s.content} style={{ marginTop: '60px' }}>
        {
          (totalType == 'expense' ? expenseData : incomeData).map(item => <div key={item.type_id} className={s.item}>
            <div className={s.left}>
              <div className={s.name}>
                <span className={cx({ [s.expense]: totalType == 'expense', [s.income]: totalType == 'income' }, s.name)}>
                  {item.type_name}
                </span>
              </div>
              <div className={s.progress}>{ Number(item.number).toFixed() || 0 }</div>
            </div>
            <div className={s.right}>
              <div className={s.percent}>
                <Progress
                  shape="line"
                  percent={Number((item.number / Number(totalType == 'expense' ? totalExpense : totalIncome)) * 100).toFixed()}
                  theme='primary'
                />
              </div>
            </div>
          </div>)
        }
      </div>
    </div>
    <PopupDate ref={monthRef} mode="month" onSelect={selectMonth} />
  </div>
}

export default Data;