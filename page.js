// 渲染单个待办事项
function renderTask(text,index,stat){
  let item = `
              <section class='task'>
              <div class='task-left'>
              
              <input
              type='checkbox'
              class='enter'
              ${stat ? 'checked' : ''}
              >
              <span>${text}</span>
              </div>
              <div class='task-right'>
              <span data-id=${index} class='del'>删除</span>
              <span data-id=${index} class='detail'>详情</span>
              </div>
              </section>
         `;
    return item = $(item);
}


function addTask(){
  let btn = $('.main-button');
  btn.on('click',function(){
    console.log('add!');
    let cont = $(this).prev().val(),
        list = store.get('taskList'),
        msg = {'content':cont};
    if(cont === '') return;
    list.push(msg);
    store.set('taskList',list);
    $(this).prev().val(null);
    init();
  })
}


// *********删除任务***************
function del_task(){
  let yes = $('.yes'),
      no = $('.no'),
      binder = $('.content'),
      confirm = $('.confirm'),
      mask = $('.mask');
  binder.on('click','.del',function(){
    let list = store.get('taskList'),
        id =parseInt($(this).attr('data-id')) ,
        data = list.find((obj) => obj.index === id);
    showAlert('确认删除此条?');
    yes.on('click',function(){
      console.log('yes!');
      list.splice(list.indexOf(data),1);
      store.set('taskList',list);
      confirm.hide();
      mask.hide();
      init();
    });
    no.on('click',function(){
      $('.confirm').hide();
      $('.mask').hide();
    });
  })
}


// *************勾选已完成以及撤销的模块***********
function complete(){
  let binder = $('.content');
  binder.on('click','.enter',function(){
    let $this = $(this),
        status = $this.is(':checked'),
        id = $this.parent().next().find('.del').attr('data-id'),
        list = store.get('taskList'),
        data = list.find((obj) => obj.index === parseInt(id)),
        task = $(this).parent().parent();
    if (status) {
      console.log('obj',data);
      data.complete = true;
      store.set('taskList',list);
      console.log('data',store.get('taskList'));
    }
    else {
      data.complete = false;
      store.set('taskList',list);
    }
    init();
  })
}


// ********定时循环储存的数组，核对时间并弹框提醒*********
function check(){
  let list = store.get('taskList');
  for (let obj of list){
    if ( ! obj.complete) {
      if (!obj.informed) {
        if (obj.time) {
          let currentTime = new Date().getTime(),
              taskTime = new Date(obj.time).getTime();
          if (taskTime - currentTime <= 1) {
            timeup(obj.content);
            obj.informed = true;
            store.set('taskList',list);
          }
        }
      }
    }
  }
}


function clock(){
  let clock = setInterval(check,100);
}


function timeup(msg){
  if (!msg) return;
  showAlert(msg);
  let yes = $('.yes'),
      voice = $('.alerter'),
      no = $('.no'),
      confirm = $('.confirm'),
      mask = $('.mask'),
      list = [yes,no];
  voice.get(0).play();
  list.map(x => x.on('click',function(){confirm.hide();mask.hide();}));
}


// ***********弹框及调整弹框************
function showAlert(msg){
  if(!msg) return;
  let confirm = $('.confirm'),
      mask = $('.mask'),
      cont = confirm.find('p');
  cont.text(msg);
  adjustAlert();
  mask.show();
  confirm.show();
}


function resize(){
  $(window).on('resize',function(){
    console.log('resize event!');
    adjustAlert();
  });
}


function adjustAlert(){
  let confirm = $('.confirm'),
      left = ($(window).width() - confirm.width()) / 2,
      top = ($(window).height() - confirm.height()) / 2 - 70;
  confirm.css({
    position:'fixed',
    left:left,
    top:top,
  })
}


// *********详情模块*************
function showDetail(){
    let binder = $('.content'),
        mask = $('.mask');
   binder.on('click','.detail',function(){
    let $this = $(this),
        detContent = $('.detail-content'),
        calender = detContent.next(),
        id = parseInt($this.attr('data-id')),
        list = store.get('taskList'),
        data = list.find(obj => obj.index === id),
        det = data.detail || '',
        time = data.time || '';
    console.log('data obj',data);
    detContent.text(det);
    calender.text(time);
    $('.detail-msg').val(null);
    $('#time').val(time);
    mask.show();
    mask.next().next().show();
    addDetail(data,list);
  })
}


function hideDetail(){
  let body = $('body'),
      mask = $('.mask'),
      confirm = $('.confirm');
  console.log('hide');
  body.on('click','.mask',function(){
    mask.next().next().hide();
    mask.hide();
    confirm.hide();
  })
}


function addDetail(data,list){
  console.log('addtail');
  let detailBind = $('.detail-container')
      detailBtn = $('.detail-button'),
      cont = detailBind.find('.detail-msg'),
      mask = $('.mask'),
      time = cont.next().next();
  detailBtn.on('click',function(){
    if (cont.val() === '' || time.val() === '' ) return;
    data.time = time.val();
    data.detail = cont.val();
    store.set('taskList',list);
    mask.hide();
    mask.next().next().hide();
  })
}


// 根据local渲染task列表
function init(){
  let list = store.get('taskList') || [],
      con = $('.content'),
      index = 0;
  con.html('');
  for (let i of list){
    let text = i.content,
        // completeList = [],
        status = i.complete || false;
        item = renderTask(text,index,status);
    i.index = index;
    if (status) {
      // completeList.push(i);
      item.addClass('finish');
      con.append(item);
    }
    else {
        con.prepend(item);
    }
    index++;
  }
  store.set('taskList',list);
}


function storage(msg){
  `use strict`
  let Tasks = store.get('taskList') || [];
  console.log('localstorage:',Tasks);
  Tasks.push(msg);
  store.set('taskList', Tasks);
}


$(document).ready(function(){
  init();
  addTask();
  del_task();
  showDetail();
  hideDetail();
  resize();
  complete();
  $('#time').datetimepicker();
  clock();
})
