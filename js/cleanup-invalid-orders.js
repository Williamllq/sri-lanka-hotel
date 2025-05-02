/**
 * 清理无效订单数据
 * 此脚本用于删除localStorage中格式不正确的订单记录
 */

(function() {
  // 从localStorage获取订单数据
  const storedOrders = localStorage.getItem('bookings');
  
  if (!storedOrders) {
    console.log('没有找到订单数据');
    alert('没有找到订单数据');
    return;
  }
  
  try {
    // 解析订单数据
    let orders = JSON.parse(storedOrders);
    console.log('原始订单数量:', orders.length);
    
    // 过滤掉无效的订单 (undefined ID或日期为Apr 23, 2025的$0订单)
    const validOrders = orders.filter(order => {
      // 检查是否缺少重要字段
      if (!order.id || order.id === 'undefined') {
        console.log('发现无效订单ID:', order);
        return false;
      }
      
      // 检查是否是价格为0且日期为Apr 23的订单
      if ((order.totalFare === 0 || order.price === 0) && 
          (order.journeyDate && order.journeyDate.includes('2025-04-23'))) {
        console.log('发现无效测试订单:', order);
        return false;
      }
      
      return true;
    });
    
    // 将有效订单保存回localStorage
    if (validOrders.length < orders.length) {
      localStorage.setItem('bookings', JSON.stringify(validOrders));
      console.log('已删除无效订单。原始数量:', orders.length, '新数量:', validOrders.length);
      alert(`已成功删除 ${orders.length - validOrders.length} 条无效订单数据。请刷新页面查看结果。`);
      // 刷新页面
      window.location.reload();
    } else {
      console.log('没有找到无效订单');
      alert('没有找到需要删除的无效订单');
    }
  } catch (error) {
    console.error('清理订单时出错:', error);
    alert('清理订单数据时出错: ' + error.message);
  }
})(); 