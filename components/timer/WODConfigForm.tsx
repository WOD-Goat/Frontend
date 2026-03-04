// ─────────────────────────────────────────────────────────────────────────────
// WODConfigForm — modern per-mode configuration form
//
// Each WOD mode renders its own minimal input section with stepper controls.
// The form calls `onConfirm(config)` which bubbles to the screen.
// ─────────────────────────────────────────────────────────────────────────────

import { Colors } from "@/constants/Colors";
import type {
    AMRAPConfig,
    CustomBlock,
    CustomConfig,
    DeathByConfig,
    EMOMConfig,
    EXMOMConfig,
    ForTimeConfig,
    TabataConfig,
    WODConfig,
    WODMode,
} from "@/lib/timer/types";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface WODConfigFormProps {
  mode: WODMode;
  onConfirm: (config: WODConfig) => void;
}

export interface WODConfigFormHandle {
  confirm: () => void;
}

type TriggerRef = React.MutableRefObject<(() => void) | null>;

// ─── Stepper Control ──────────────────────────────────────────────────────────

function StepperInput({
  label,
  value,
  onChange,
  unit,
  min = 1,
  step = 1,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  min?: number;
  step?: number;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const numericValue = parseInt(value, 10) || 0;

  const decrement = () => {
    const next = Math.max(min, numericValue - step);
    onChange(String(next));
  };
  const increment = () => {
    onChange(String(numericValue + step));
  };

  return (
    <View style={s.stepperRow}>
      <View style={s.stepperLabelWrap}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={Colors.neutral[500]}
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={s.stepperLabel}>{label}</Text>
        {unit && <Text style={s.stepperUnit}>{unit}</Text>}
      </View>

      <View style={s.stepperControls}>
        <Pressable
          style={({ pressed }) => [
            s.stepperBtn,
            pressed && s.stepperBtnPressed,
          ]}
          onPress={decrement}
        >
          <Ionicons name="remove" size={18} color={Colors.text.primary} />
        </Pressable>

        <TextInput
          style={s.stepperValue}
          value={value}
          onChangeText={onChange}
          onBlur={() => {
            const n = parseInt(value, 10) || 0;
            if (n < min) onChange(String(min));
          }}
          keyboardType="number-pad"
          returnKeyType="done"
          selectTextOnFocus
        />

        <Pressable
          style={({ pressed }) => [
            s.stepperBtn,
            s.stepperBtnAccent,
            pressed && s.stepperBtnPressed,
          ]}
          onPress={increment}
        >
          <Ionicons name="add" size={18} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  value,
  onValueChange,
  icon,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={s.stepperRow}>
      <View style={s.stepperLabelWrap}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={Colors.neutral[500]}
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={s.stepperLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#3A3A3C", true: Colors.primary[500] }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#3A3A3C"
      />
    </View>
  );
}

// ─── FOR TIME ─────────────────────────────────────────────────────────────────

function ForTimeForm({
  onConfirm,
  triggerRef,
}: {
  onConfirm: (c: ForTimeConfig) => void;
  triggerRef: TriggerRef;
}) {
  const [hasCap, setHasCap] = useState(false);
  const [capMinutes, setCapMinutes] = useState("20");
  const [leadIn, setLeadIn] = useState("10");

  triggerRef.current = () =>
    onConfirm({
      mode: "FOR_TIME",
      timeCap: hasCap ? parseInt(capMinutes, 10) * 60 : null,
      leadInSeconds: parseInt(leadIn, 10),
    });

  return (
    <>
      <ToggleRow
        label="Time Cap"
        value={hasCap}
        onValueChange={setHasCap}
        icon="timer-outline"
      />

      {hasCap && (
        <StepperInput
          label="Cap"
          value={capMinutes}
          onChange={setCapMinutes}
          unit="min"
          icon="hourglass-outline"
        />
      )}

      <StepperInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
        min={5}
        icon="play-outline"
      />
    </>
  );
}

// ─── AMRAP ────────────────────────────────────────────────────────────────────

function AMRAPForm({
  onConfirm,
  triggerRef,
}: {
  onConfirm: (c: AMRAPConfig) => void;
  triggerRef: TriggerRef;
}) {
  const [minutes, setMinutes] = useState("20");
  const [leadIn, setLeadIn] = useState("10");

  triggerRef.current = () =>
    onConfirm({
      mode: "AMRAP",
      durationSeconds: parseInt(minutes, 10) * 60,
      leadInSeconds: parseInt(leadIn, 10),
    });

  return (
    <>
      <StepperInput
        label="Duration"
        value={minutes}
        onChange={setMinutes}
        unit="min"
        icon="time-outline"
      />
      <StepperInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
        min={5}
        icon="play-outline"
      />
    </>
  );
}

// ─── EMOM ─────────────────────────────────────────────────────────────────────

function EMOMForm({
  onConfirm,
  triggerRef,
}: {
  onConfirm: (c: EMOMConfig) => void;
  triggerRef: TriggerRef;
}) {
  const [totalMinutes, setTotalMinutes] = useState("12");
  const [leadIn, setLeadIn] = useState("10");

  triggerRef.current = () =>
    onConfirm({
      mode: "EMOM",
      totalMinutes: parseInt(totalMinutes, 10),
      leadInSeconds: parseInt(leadIn, 10),
    });

  return (
    <>
      <StepperInput
        label="Total Minutes"
        value={totalMinutes}
        onChange={setTotalMinutes}
        unit="min"
        icon="time-outline"
      />
      <StepperInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
        min={5}
        icon="play-outline"
      />
    </>
  );
}

// ─── EXMOM ────────────────────────────────────────────────────────────────────

function EXMOMForm({
  onConfirm,
  triggerRef,
}: {
  onConfirm: (c: EXMOMConfig) => void;
  triggerRef: TriggerRef;
}) {
  const [intervalSec, setIntervalSec] = useState("90");
  const [totalIntervals, setTotalIntervals] = useState("8");
  const [leadIn, setLeadIn] = useState("10");

  triggerRef.current = () =>
    onConfirm({
      mode: "EXMOM",
      intervalSeconds: parseInt(intervalSec, 10),
      totalIntervals: parseInt(totalIntervals, 10),
      leadInSeconds: parseInt(leadIn, 10),
    });

  return (
    <>
      <StepperInput
        label="Interval"
        value={intervalSec}
        onChange={setIntervalSec}
        unit="sec"
        icon="swap-horizontal-outline"
      />
      <StepperInput
        label="Rounds"
        value={totalIntervals}
        onChange={setTotalIntervals}
        icon="repeat-outline"
      />
      <StepperInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
        min={5}
        icon="play-outline"
      />
    </>
  );
}

// ─── TABATA ───────────────────────────────────────────────────────────────────

function TabataForm({
  onConfirm,
  triggerRef,
}: {
  onConfirm: (c: TabataConfig) => void;
  triggerRef: TriggerRef;
}) {
  const [work, setWork] = useState("20");
  const [rest, setRest] = useState("10");
  const [rounds, setRounds] = useState("8");
  const [leadIn, setLeadIn] = useState("10");

  triggerRef.current = () =>
    onConfirm({
      mode: "TABATA",
      workSeconds: parseInt(work, 10),
      restSeconds: parseInt(rest, 10),
      rounds: parseInt(rounds, 10),
      leadInSeconds: parseInt(leadIn, 10),
    });

  return (
    <>
      <StepperInput
        label="Work"
        value={work}
        onChange={setWork}
        unit="sec"
        step={5}
        icon="flame-outline"
      />
      <StepperInput
        label="Rest"
        value={rest}
        onChange={setRest}
        unit="sec"
        step={5}
        icon="bed-outline"
      />
      <StepperInput
        label="Rounds"
        value={rounds}
        onChange={setRounds}
        icon="repeat-outline"
      />
      <StepperInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
        min={5}
        icon="play-outline"
      />
    </>
  );
}

// ─── DEATH BY ─────────────────────────────────────────────────────────────────

function DeathByForm({
  onConfirm,
  triggerRef,
}: {
  onConfirm: (c: DeathByConfig) => void;
  triggerRef: TriggerRef;
}) {
  const [maxMinutes, setMaxMinutes] = useState("20");
  const [leadIn, setLeadIn] = useState("10");

  triggerRef.current = () =>
    onConfirm({
      mode: "DEATH_BY",
      maxMinutes: parseInt(maxMinutes, 10),
      leadInSeconds: parseInt(leadIn, 10),
    });

  return (
    <>
      <StepperInput
        label="Max Minutes"
        value={maxMinutes}
        onChange={setMaxMinutes}
        unit="min"
        icon="skull-outline"
      />
      <StepperInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
        min={5}
        icon="play-outline"
      />
    </>
  );
}

// ─── CUSTOM INTERVAL BUILDER ──────────────────────────────────────────────────

let _blockIdCounter = 1;

function CustomForm({
  onConfirm,
  triggerRef,
}: {
  onConfirm: (c: CustomConfig) => void;
  triggerRef: TriggerRef;
}) {
  const [blocks, setBlocks] = useState<CustomBlock[]>([
    {
      id: "b1",
      label: "Work",
      durationSeconds: 40,
      phase: "WORK",
      announce: true,
    },
    {
      id: "b2",
      label: "Rest",
      durationSeconds: 20,
      phase: "REST",
      announce: true,
    },
  ]);
  const [cycles, setCycles] = useState("5");
  const [leadIn, setLeadIn] = useState("10");

  triggerRef.current = () =>
    onConfirm({
      mode: "CUSTOM",
      blocks,
      cycles: parseInt(cycles, 10),
      leadInSeconds: parseInt(leadIn, 10),
    });

  function addBlock() {
    _blockIdCounter++;
    setBlocks((prev) => [
      ...prev,
      {
        id: `b${_blockIdCounter}`,
        label: "Block",
        durationSeconds: 30,
        phase: "WORK",
        announce: true,
      },
    ]);
  }

  function updateBlock(
    id: string,
    field: keyof CustomBlock,
    value: string | boolean,
  ) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (field === "durationSeconds")
          return { ...b, durationSeconds: parseInt(value as string, 10) || 10 };
        if (field === "phase") return { ...b, phase: value as "WORK" | "REST" };
        if (field === "label") return { ...b, label: value as string };
        if (field === "announce") return { ...b, announce: value as boolean };
        return b;
      }),
    );
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <>
      {blocks.map((block, i) => (
        <View key={block.id} style={s.blockCard}>
          <View style={s.blockHeader}>
            <View style={s.blockBadge}>
              <Text style={s.blockBadgeText}>{i + 1}</Text>
            </View>
            <TextInput
              style={s.blockLabelInput}
              value={block.label}
              onChangeText={(v) => updateBlock(block.id, "label", v)}
              placeholderTextColor={Colors.neutral[500]}
              placeholder="Label"
            />
            <TouchableOpacity
              style={s.blockRemoveBtn}
              onPress={() => removeBlock(block.id)}
            >
              <Ionicons
                name="close-circle"
                size={22}
                color={Colors.error[500]}
              />
            </TouchableOpacity>
          </View>

          <StepperInput
            label="Duration"
            value={String(block.durationSeconds)}
            onChange={(v) => updateBlock(block.id, "durationSeconds", v)}
            unit="sec"
            step={5}
          />

          <View style={s.phaseRow}>
            <Text style={s.stepperLabel}>Phase</Text>
            <View style={s.phaseToggle}>
              {(["WORK", "REST"] as const).map((p) => (
                <Pressable
                  key={p}
                  style={[
                    s.phaseBtn,
                    block.phase === p &&
                      (p === "WORK" ? s.phaseBtnWork : s.phaseBtnRest),
                  ]}
                  onPress={() => updateBlock(block.id, "phase", p)}
                >
                  <Ionicons
                    name={p === "WORK" ? "flame" : "bed"}
                    size={14}
                    color={block.phase === p ? "#FFF" : Colors.neutral[500]}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      s.phaseBtnText,
                      block.phase === p && s.phaseBtnTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ))}

      <Pressable
        style={({ pressed }) => [s.addBlockBtn, pressed && { opacity: 0.7 }]}
        onPress={addBlock}
      >
        <Ionicons
          name="add-circle-outline"
          size={20}
          color={Colors.primary[500]}
        />
        <Text style={s.addBlockText}>Add Block</Text>
      </Pressable>

      <StepperInput
        label="Cycles"
        value={cycles}
        onChange={setCycles}
        icon="repeat-outline"
      />
      <StepperInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
        min={5}
        icon="play-outline"
      />
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const WODConfigForm = forwardRef<
  WODConfigFormHandle,
  WODConfigFormProps
>(function WODConfigForm({ mode, onConfirm }, ref) {
  const triggerRef = useRef<(() => void) | null>(null);

  useImperativeHandle(ref, () => ({
    confirm: () => triggerRef.current?.(),
  }));

  return (
    <View style={s.formContent}>
      {mode === "FOR_TIME" && (
        <ForTimeForm onConfirm={onConfirm} triggerRef={triggerRef} />
      )}
      {mode === "AMRAP" && (
        <AMRAPForm onConfirm={onConfirm} triggerRef={triggerRef} />
      )}
      {mode === "EMOM" && (
        <EMOMForm onConfirm={onConfirm} triggerRef={triggerRef} />
      )}
      {mode === "EXMOM" && (
        <EXMOMForm onConfirm={onConfirm} triggerRef={triggerRef} />
      )}
      {mode === "TABATA" && (
        <TabataForm onConfirm={onConfirm} triggerRef={triggerRef} />
      )}
      {mode === "DEATH_BY" && (
        <DeathByForm onConfirm={onConfirm} triggerRef={triggerRef} />
      )}
      {mode === "CUSTOM" && (
        <CustomForm onConfirm={onConfirm} triggerRef={triggerRef} />
      )}
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  formContent: {
    padding: 18,
    gap: 2,
  },

  /* ── Stepper Row ── */
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  stepperLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stepperLabel: {
    fontFamily: "LeagueSpartan-SemiBold",
    fontSize: 15,
    color: Colors.text.primary,
    letterSpacing: 0.3,
  },
  stepperUnit: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: Colors.neutral[500],
    marginLeft: 6,
  },

  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnAccent: {
    backgroundColor: Colors.primary[500],
  },
  stepperBtnPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
  stepperValue: {
    width: 56,
    height: 38,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    textAlign: "center",
    color: "#FFFFFF",
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 20,
  },

  /* ── Custom Block Card ── */
  blockCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 14,
    gap: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  blockBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
  },
  blockBadgeText: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 14,
    color: "#FFF",
  },
  blockLabelInput: {
    flex: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    paddingHorizontal: 12,
    color: Colors.text.primary,
    fontFamily: "LeagueSpartan-SemiBold",
    fontSize: 15,
  },
  blockRemoveBtn: {
    padding: 4,
  },

  /* ── Phase Toggle ── */
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  phaseToggle: {
    flexDirection: "row",
    gap: 8,
  },
  phaseBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  phaseBtnWork: {
    backgroundColor: Colors.primary[500],
  },
  phaseBtnRest: {
    backgroundColor: Colors.success[600],
  },
  phaseBtnText: {
    fontFamily: "LeagueSpartan-SemiBold",
    fontSize: 13,
    color: Colors.neutral[500],
  },
  phaseBtnTextActive: {
    color: "#FFF",
  },

  /* ── Add Block ── */
  addBlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary[500],
    borderStyle: "dashed",
    marginBottom: 8,
  },
  addBlockText: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 15,
    color: Colors.primary[500],
  },
});
