export interface HouseRule {
  icon: string;
  category: string;
  rules: string[];
}

interface PropertyData {
  guests: number;
  petsAllowed: boolean;
  petFeeAmount: number | null;
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

  const petFeeAmount = property.petFeeAmount ?? 100;
  const petRule = property.petsAllowed
    ? `Pets allowed — maximum 3 pets, $${petFeeAmount} per pet per stay`
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
