package com.soutenza.defenses.domain;

public enum Mention {
    AJOURNE("Ajourne"),
    PASSABLE("Passable"),
    ASSEZ_BIEN("Assez Bien"),
    BIEN("Bien"),
    TRES_BIEN("Tres Bien");

    private final String label;

    Mention(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
