package com.journalsystem.springprogram.config;

import com.journalsystem.springprogram.listener.OnlineCountListener;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 监听器配置类：将自定义的OnlineCountListener注册到Servlet容器，使其生效，发生在应用启动时
 */

@Configuration//告诉spring这是一个配置类，spring会自动扫描并加载它，并执行其中的方法

//里面的方法会在应用启动时被调用，将OnlineCountListener注册到Servlet容器
public class ListenerConfig {
    /**
     * 注册在线人数统计监听器
     */
    @Bean //方法返回值为ServletListenerRegistrationBean<OnlineCountListener>，spring会自动将其注册到Servlet容器，并由其进行管理
    public ServletListenerRegistrationBean<OnlineCountListener> onlineCountListener() {
        // 创建Servlet监听器注册Bean
        ServletListenerRegistrationBean<OnlineCountListener> bean = new ServletListenerRegistrationBean<>();
        // 绑定自定义监听器（如果监听器加了@Component，也可注入：@Autowired private OnlineCountListener listener;）
        bean.setListener(new OnlineCountListener());
        return bean;//返回注册Bean，spring会自动将其注册到Servlet容器
    }

}
