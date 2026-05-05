export interface HouseRule {
  icon: string;
  category: string;
  rules: string[];
}

interface PropertyData {
  guests: number;
  petsAllowed: boolean;
  petFee: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInInstructions: string | null;
  checkOutInstructions: string | null;
}

export function getHouseRules(property: PropertyData): HouseRule[] {
  const additionalRules: string[] = [
    "Please turn off lights when not in use",
    ...(property.checkInInstructions ? [property.checkInInstructions] : []),
    ...(property.checkOutInstructions ? [property.checkOutInstructions] : []),
  ];

  const petRule = property.petsAllowed
    ? property.petFee != null && property.petFee > 0
      ? `Pets allowed — $${property.petFee} pet fee per stay`
      : "Pets allowed"
    : "No pets allowed";

  return [
    {
      category: "Checking in and out",
      icon: "Clock",
      rules: [
        `Check-in after ${property.checkInTime ?? "2:00 PM"}`,
        `Checkout before ${property.checkOutTime ?? "12:00 PM"}`,
        "Self check-in with keypad",
      ],
    },
    {
      category: "During your stay",
      icon: "Home",
      rules: [
        `${property.guests} guests maximum`,
        petRule,
        "Quiet hours: 8:00 PM – 6:00 AM",
        "No parties or events",
        "No commercial photography",
        "No smoking",
      ],
    },
    {
      category: "Additional rules",
      icon: "FileText",
      rules: additionalRules,
    },
    {
      category: "Before you leave",
      icon: "LogOut",
      rules: [
        "Gather used towels",
        "Throw trash away",
        "Turn things off",
        "Lock up",
      ],
    },
  ];
}
