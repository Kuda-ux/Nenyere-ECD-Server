import type { AnyActivity } from "../schema";
import { base, SKILL } from "./helpers";

export const preWritingActivities: AnyActivity[] = [
  // -- Trace Straight Line --
  {
    ...base("00000000-0000-0000-0002-000000000001", "tracing", "trace", "Trace the Line", {
      learning_area: "physical_education_and_arts", skills: [SKILL.trace_line],
      description: "Trace a straight line", scoring_method: "coverage",
      title_sn: "Tevera Mutsara", title_nd: "Landela Umugqa",
      instruction: "Drag your finger along the line!",
      instruction_sn: "Tembera chigunwe chako mutsara!", instruction_nd: "Hudula umunwe wakho umugqa!",
      tags: ["pre-writing"],
    }),
    items: [{
      id: "t1",
      strokes: [{ id: "sk1", points: [{ x: 0.2, y: 0.5 }, { x: 0.8, y: 0.5 }], colour: "#F2A93B", width: 12, is_guide: true }],
      tolerance: 0.08, min_coverage: 0.6,
    }],
    canvas_width: 400, canvas_height: 200,
    brush_colours: ["#F2A93B", "#E85D5D", "#5BA85B"], show_starting_dot: true,
  } as unknown as AnyActivity,

  // -- Trace Circle --
  {
    ...base("00000000-0000-0000-0002-000000000002", "tracing", "trace", "Trace the Circle", {
      learning_area: "physical_education_and_arts", skills: [SKILL.trace_line, SKILL.shape_circle],
      description: "Trace around the circle", scoring_method: "coverage",
      title_sn: "Tevera Denderedzwa", title_nd: "Landela Isiyingi",
      instruction: "Trace around the circle!",
      tags: ["pre-writing"],
    }),
    items: [{
      id: "t1",
      strokes: [{
        id: "sk1",
        points: [
          { x: 0.5, y: 0.2 }, { x: 0.7, y: 0.3 }, { x: 0.8, y: 0.5 },
          { x: 0.7, y: 0.7 }, { x: 0.5, y: 0.8 }, { x: 0.3, y: 0.7 },
          { x: 0.2, y: 0.5 }, { x: 0.3, y: 0.3 }, { x: 0.5, y: 0.2 },
        ],
        colour: "#3B7DD8", width: 10, is_guide: true,
      }],
      tolerance: 0.1, min_coverage: 0.5,
    }],
    canvas_width: 300, canvas_height: 300,
    brush_colours: ["#3B7DD8", "#F2A93B", "#E85D5D"], show_starting_dot: true,
  } as unknown as AnyActivity,

  // -- Trace Zigzag (ECD_B) --
  {
    ...base("00000000-0000-0000-0002-000000000003", "tracing", "trace", "Trace the Zigzag", {
      ecd_level: "ECD_B", difficulty: "standard",
      learning_area: "physical_education_and_arts", skills: [SKILL.trace_line],
      description: "Trace a zigzag line", scoring_method: "coverage",
      title_sn: "Tevera Mutsara Unopinduka", title_nd: "Landela Umugqa Ojikelezayo",
      instruction: "Follow the zigzag!",
      tags: ["pre-writing"],
    }),
    items: [{
      id: "t1",
      strokes: [{
        id: "sk1",
        points: [
          { x: 0.15, y: 0.3 }, { x: 0.35, y: 0.7 }, { x: 0.5, y: 0.3 },
          { x: 0.65, y: 0.7 }, { x: 0.85, y: 0.3 },
        ],
        colour: "#E85D5D", width: 10, is_guide: true,
      }],
      tolerance: 0.1, min_coverage: 0.5,
    }],
    canvas_width: 400, canvas_height: 200,
    brush_colours: ["#E85D5D", "#F2A93B", "#5BA85B"], show_starting_dot: true,
  } as unknown as AnyActivity,

  // -- Trace Vertical Line --
  {
    ...base("00000000-0000-0000-0002-000000000004", "tracing", "trace", "Trace Up and Down", {
      learning_area: "physical_education_and_arts", skills: [SKILL.trace_line],
      description: "Trace a vertical line", scoring_method: "coverage",
      title_sn: "Tevera Kumusoro nePasi", title_nd: "Landela Phezulu nesiPhezansi",
      instruction: "Drag from top to bottom!",
      tags: ["pre-writing"],
    }),
    items: [{
      id: "t1",
      strokes: [{ id: "sk1", points: [{ x: 0.5, y: 0.2 }, { x: 0.5, y: 0.8 }], colour: "#5BA85B", width: 12, is_guide: true }],
      tolerance: 0.08, min_coverage: 0.6,
    }],
    canvas_width: 300, canvas_height: 300,
    brush_colours: ["#5BA85B", "#F2A93B", "#E85D5D"], show_starting_dot: true,
  } as unknown as AnyActivity,

  // -- Trace Letter A (ECD_B) --
  {
    ...base("00000000-0000-0000-0002-000000000005", "tracing", "trace", "Trace Letter A", {
      ecd_level: "ECD_B", difficulty: "standard",
      learning_area: "english_language", skills: [SKILL.trace_line, SKILL.phonics_a],
      description: "Trace the letter A", scoring_method: "coverage",
      title_sn: "Tevera Tariri A", title_nd: "Landela Unonjani A",
      instruction: "Trace the letter A!",
      tags: ["pre-writing"],
    }),
    items: [{
      id: "t1",
      strokes: [{
        id: "sk1",
        points: [{ x: 0.3, y: 0.8 }, { x: 0.5, y: 0.2 }, { x: 0.7, y: 0.8 }],
        colour: "#F2A93B", width: 10, is_guide: true,
      }, {
        id: "sk2",
        points: [{ x: 0.38, y: 0.55 }, { x: 0.62, y: 0.55 }],
        colour: "#F2A93B", width: 10, is_guide: true,
      }],
      tolerance: 0.1, min_coverage: 0.5,
    }],
    canvas_width: 300, canvas_height: 300,
    brush_colours: ["#F2A93B", "#3B7DD8", "#E85D5D"], show_starting_dot: true,
  } as unknown as AnyActivity,
];
