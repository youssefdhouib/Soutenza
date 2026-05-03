package com.soutenza.common.util;

import com.soutenza.defenses.domain.Mention;

import java.math.BigDecimal;

public final class MentionRules {

    private MentionRules() {
    }

    public static Mention resolveMention(BigDecimal average) {
        if (average == null) {
            return null;
        }

        double value = average.doubleValue();
        if (value < 10.0) {
            return Mention.AJOURNE;
        }
        if (value < 12.0) {
            return Mention.PASSABLE;
        }
        if (value < 14.0) {
            return Mention.ASSEZ_BIEN;
        }
        if (value < 16.0) {
            return Mention.BIEN;
        }
        return Mention.TRES_BIEN;
    }
}
