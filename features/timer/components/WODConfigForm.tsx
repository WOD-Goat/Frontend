// ─────────────────────────────────────────────────────────────────────────────
// WODConfigForm — per-mode configuration form
//
// Each WOD mode renders its own minimal input section.
// The form calls `onConfirm(config)` which bubbles to the screen.
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/Colors";
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
} from "../types";

interface WODConfigFormProps {
  mode: WODMode;
  onConfirm: (config: WODConfig) => void;
}

export interface WODConfigFormHandle {
  confirm: () => void;
}

type TriggerRef = React.MutableRefObject<(() => void) | null>;

// ─── Helper ───────────────────────────────────────────────────────────────────

function NumericInput({
  label,
  value,
  onChange,
  unit,
  min = 1,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  min?: number;
}) {
  return (
    <View style={formStyles.row}>
      <Text style={formStyles.label}>{label}</Text>
      <View style={formStyles.inputWrap}>
        <TextInput
          style={formStyles.input}
          value={value}
          onChangeText={onChange}
          keyboardType="number-pad"
          placeholderTextColor="#8E8E93"
          returnKeyType="done"
        />
        {unit ? <Text style={formStyles.unit}>{unit}</Text> : null}
      </View>
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
      <View style={formStyles.row}>
        <Text style={formStyles.label}>Time Cap</Text>
        <Switch
          value={hasCap}
          onValueChange={setHasCap}
          trackColor={{ false: "#2E2E2E", true: Colors.primary[500] }}
          thumbColor="#FFFFFF"
        />
      </View>

      {hasCap && (
        <NumericInput
          label="Cap"
          value={capMinutes}
          onChange={setCapMinutes}
          unit="min"
        />
      )}

      <NumericInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
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
      <NumericInput
        label="Duration"
        value={minutes}
        onChange={setMinutes}
        unit="min"
      />
      <NumericInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
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
      <NumericInput
        label="Total Minutes"
        value={totalMinutes}
        onChange={setTotalMinutes}
        unit="min"
      />
      <NumericInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
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
      <NumericInput
        label="Interval"
        value={intervalSec}
        onChange={setIntervalSec}
        unit="sec"
      />
      <NumericInput
        label="Rounds"
        value={totalIntervals}
        onChange={setTotalIntervals}
      />
      <NumericInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
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
      <NumericInput label="Work" value={work} onChange={setWork} unit="sec" />
      <NumericInput label="Rest" value={rest} onChange={setRest} unit="sec" />
      <NumericInput label="Rounds" value={rounds} onChange={setRounds} />
      <NumericInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
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
      <NumericInput
        label="Max Minutes"
        value={maxMinutes}
        onChange={setMaxMinutes}
        unit="min"
      />
      <NumericInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
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
        <View key={block.id} style={formStyles.blockCard}>
          <Text style={formStyles.blockIndex}>Block {i + 1}</Text>
          <TextInput
            style={[formStyles.input, { marginBottom: 8 }]}
            value={block.label}
            onChangeText={(v) => updateBlock(block.id, "label", v)}
            placeholderTextColor="#8E8E93"
            placeholder="Label"
          />
          <NumericInput
            label="Duration"
            value={String(block.durationSeconds)}
            onChange={(v) => updateBlock(block.id, "durationSeconds", v)}
            unit="sec"
          />
          <View style={formStyles.row}>
            <Text style={formStyles.label}>Phase</Text>
            <View style={formStyles.phaseToggle}>
              {(["WORK", "REST"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    formStyles.phaseBtn,
                    block.phase === p && formStyles.phaseBtnActive,
                  ]}
                  onPress={() => updateBlock(block.id, "phase", p)}
                >
                  <Text
                    style={[
                      formStyles.phaseBtnText,
                      block.phase === p && formStyles.phaseBtnTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity onPress={() => removeBlock(block.id)}>
            <Text style={formStyles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={formStyles.addBlockBtn} onPress={addBlock}>
        <Text style={formStyles.addBlockText}>+ Add Block</Text>
      </TouchableOpacity>

      <NumericInput label="Cycles" value={cycles} onChange={setCycles} />
      <NumericInput
        label="Lead-in"
        value={leadIn}
        onChange={setLeadIn}
        unit="sec"
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
    <ScrollView
      style={formStyles.scroll}
      contentContainerStyle={formStyles.content}
      keyboardShouldPersistTaps="handled"
    >
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
    </ScrollView>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const formStyles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#1C1C1E" },
  content: { padding: 24, paddingBottom: 80, gap: 16 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontFamily: "LeagueSpartan-SemiBold",
    fontSize: 16,
    color: "#E6EDF3",
    letterSpacing: 1,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    width: 80,
    height: 44,
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    textAlign: "center",
    color: "#E6EDF3",
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 20,
  },
  unit: {
    fontFamily: "LeagueSpartan-Regular",
    fontSize: 14,
    color: "#8E8E93",
  },

  blockCard: {
    backgroundColor: "#2E2E2E",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  blockIndex: {
    fontFamily: "LeagueSpartan-SemiBold",
    fontSize: 14,
    color: "#8E8E93",
    letterSpacing: 2,
    marginBottom: 4,
  },
  phaseToggle: {
    flexDirection: "row",
    gap: 8,
  },
  phaseBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
  },
  phaseBtnActive: {
    backgroundColor: "#FF6B2C",
  },
  phaseBtnText: {
    fontFamily: "LeagueSpartan-SemiBold",
    fontSize: 13,
    color: "#8E8E93",
  },
  phaseBtnTextActive: {
    color: "#000",
  },
  removeText: {
    fontFamily: "LeagueSpartan-Regular",
    fontSize: 13,
    color: "#FF3B30",
    alignSelf: "flex-end",
  },
  addBlockBtn: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF6B2C",
    borderStyle: "dashed",
  },
  addBlockText: {
    fontFamily: "LeagueSpartan-SemiBold",
    fontSize: 16,
    color: "#FF6B2C",
  },
});
