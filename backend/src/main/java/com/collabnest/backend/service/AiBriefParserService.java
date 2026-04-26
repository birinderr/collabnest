package com.collabnest.backend.service;

import com.collabnest.backend.dto.ParsedCampaignDto;

import java.util.List;

public interface AiBriefParserService {
    List<ParsedCampaignDto> parseBrief(String text);
}