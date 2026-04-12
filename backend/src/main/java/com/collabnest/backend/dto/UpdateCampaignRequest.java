package com.collabnest.backend.dto;

import com.collabnest.backend.enums.CampaignPriority;
import com.collabnest.backend.enums.CampaignStatus;
import com.collabnest.backend.enums.ContentType;
import com.collabnest.backend.enums.PaymentStatus;
import com.collabnest.backend.enums.Platform;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateCampaignRequest {

    private String brandName;

    private String campaignName;

    private Platform platform;

    private String customPlatform;

    private ContentType contentType;

    private String customContentType;

    private LocalDate deadline;

    @DecimalMin(value = "0.0", inclusive = true, message = "Amount must be non-negative")
    private BigDecimal amount;

    private CampaignPriority priority;

    private PaymentStatus paymentStatus;

    private LocalDate paymentDueDate;

    private LocalDate paymentReceivedDate;

    private CampaignStatus campaignStatus;

    private String contactName;

    @Email(message = "Invalid contact email")
    private String contactEmail;

    private String notes;
}