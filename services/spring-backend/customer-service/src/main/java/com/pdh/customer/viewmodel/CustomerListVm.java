package com.pdh.customer.viewmodel;

import java.util.List;

public record CustomerListVm(int totalUser, List<CustomerAdminVm> customers, int totalPage) {

}
