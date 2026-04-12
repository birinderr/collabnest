package com.collabnest.backend.dto;

import com.collabnest.backend.enums.CampaignPriority;
import com.collabnest.backend.enums.CampaignStatus;
import com.collabnest.backend.enums.ContentType;
import com.collabnest.backend.enums.PaymentStatus;
import com.collabnest.backend.enums.Platform;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateCampaignRequest {

    @NotBlank(message = "Brand name is required")
    private String brandName;

    @NotBlank(message = "Campaign name is required")
    private String campaignName;

    @NotNull(message = "Platform is required")
    private Platform platform;

    private String customPlatform;

    @NotNull(message = "Content type is required")
    private ContentType contentType;

    private String customContentType;

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Amount must be non-negative")
    private BigDecimal amount;

    private CampaignPriority priority = CampaignPriority.MEDIUM;

    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private LocalDate paymentDueDate;

    private LocalDate paymentReceivedDate;

    private CampaignStatus campaignStatus = CampaignStatus.DRAFT;

    private String contactName;

    @Email(message = "Invalid contact email")
    private String contactEmail;

    private String notes;

    private Long creatorId; // admin only
}