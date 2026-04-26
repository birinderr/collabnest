package com.collabnest.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiBriefRequestDto {

    @NotBlank(message = "Brief text cannot be empty")
    private String text;
}