package com.soutenza.common.util;

import com.soutenza.defenses.domain.Mention;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MentionRulesTest {

    @Test
    void shouldResolveMentionThresholds() {
        assertEquals(Mention.AJOURNE, MentionRules.resolveMention(new BigDecimal("9.99")));
        assertEquals(Mention.PASSABLE, MentionRules.resolveMention(new BigDecimal("10.00")));
        assertEquals(Mention.ASSEZ_BIEN, MentionRules.resolveMention(new BigDecimal("12.00")));
        assertEquals(Mention.BIEN, MentionRules.resolveMention(new BigDecimal("14.00")));
        assertEquals(Mention.TRES_BIEN, MentionRules.resolveMention(new BigDecimal("16.00")));
    }
}
