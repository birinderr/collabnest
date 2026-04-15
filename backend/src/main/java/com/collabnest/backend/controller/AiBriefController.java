package com.collabnest.backend.controller;

import com.collabnest.backend.dto.AiBriefRequestDto;
import com.collabnest.backend.dto.AiBriefResponseDto;
import com.collabnest.backend.service.AiBriefParserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiBriefController {

    private final AiBriefParserService aiBriefParserService;

    @PostMapping("/parse-brief")
    public AiBriefResponseDto parseBrief(
            @Valid @RequestBody AiBriefRequestDto request
    ) {
        return new AiBriefResponseDto(
                aiBriefParserService.parseBrief(request.getText())
        );
    }
}