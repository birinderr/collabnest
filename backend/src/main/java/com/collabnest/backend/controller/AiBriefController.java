package com.collabnest.backend.controller;

import com.collabnest.backend.dto.AiBriefRequestDto;
import com.collabnest.backend.dto.AiBriefResponseDto;
import com.collabnest.backend.dto.ParsedCampaignDto;
import com.collabnest.backend.entity.Campaign;
import com.collabnest.backend.entity.User;
import com.collabnest.backend.repository.UserRepository;
import com.collabnest.backend.service.AiBriefParserService;
import com.collabnest.backend.service.CampaignService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiBriefController {

    private final AiBriefParserService aiBriefParserService;
    private final CampaignService campaignService;
    private final UserRepository userRepository;

    @PostMapping("/parse-brief")
    public AiBriefResponseDto parseBrief(
            @Valid @RequestBody AiBriefRequestDto request
    ) {
        return new AiBriefResponseDto(
                aiBriefParserService.parseBrief(request.getText())
        );
    }

    @PostMapping("/parse-and-create")
    public ResponseEntity<?> parseAndCreate(
            @Valid @RequestBody AiBriefRequestDto request,
            Authentication authentication
    ) {

        String text = request.getText();

        // 2. Parse (AI + rule hybrid)
        List<ParsedCampaignDto> parsed =
                aiBriefParserService.parseBrief(text);

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Campaign> saved =
                campaignService.createFromParsed(parsed, user);

        return ResponseEntity.ok(saved);
    }
}