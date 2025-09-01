package com.pdh.hotel.mcp;

import com.pdh.hotel.controller.BackofficeHotelController;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import com.pdh.hotel.controller.HotelController;

@Configuration
public class HotelMcpServer {


    @Bean
    public ToolCallbackProvider hotelTools(BackofficeHotelController hotelController){
        return MethodToolCallbackProvider.builder().toolObjects(hotelController).build();
    }

}
