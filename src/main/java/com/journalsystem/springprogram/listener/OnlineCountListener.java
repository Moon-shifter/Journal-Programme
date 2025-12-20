package com.journalsystem.springprogram.listener;

import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;



public class OnlineCountListener implements HttpSessionListener {//实现了HttpSessionListener接口，用于监听Session的创建和销毁事件，会被添加到Spring容器中

    // 原子整数：统计在线人数（初始值0，多线程安全）
    private final AtomicInteger onlineUserCount = new AtomicInteger(0);


    /**
     * Session创建时触发（用户首次登录/访问系统，创建新Session）
     */
    @Override
    public void sessionCreated(HttpSessionEvent se) {
       // 在线人数+1
        int count=onlineUserCount.incrementAndGet();//这个方法会让在线人数+1，并返回新值
        //在线人数存入全局上下文
        se.getSession().getServletContext().setAttribute("onlineUserCount",count);
        // 打印在线人数
        System.out.println("当前在线人数：" + count);
    }

    /**
     * Session创建时触发（用户首次登录/访问系统，创建新Session）
     */
    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        //在线人数-1
        int count=onlineUserCount.decrementAndGet();
        if(count<0){
            // 防止在线人数为负数，发生于session过期后，用户手动关闭浏览器导致session销毁
            onlineUserCount.set(0);
            count=0;
        }
        //更新全局上下文的在线人数
        se.getSession().getServletContext().setAttribute("onlineUserCount",count);
        // 打印在线人数
        System.out.println("有用户下线，当前在线人数：" + count);
    }

    /**
     * 获取当前在线人数
     * @return 当前在线人数
     */
    public int getOnlineUserCount() {
        return onlineUserCount.get();
    }
}
