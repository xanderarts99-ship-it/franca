import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
try {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] ??= val;
  }
} catch {
  console.warn("Could not load .env.local — ensure env vars are set");
}

interface ReviewData {
  guestName: string;
  guestLocation: string | null;
  rating: number;
  comment: string;
  reviewDate: string;
}

interface PropertyData {
  name: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  description: string;
  amenities: string[];
  reviews?: ReviewData[];
  skipReviews?: boolean;
}

// bathrooms schema is Int — 2.5 rounded to 3
const PROPERTIES: PropertyData[] = [
  {
    name: "Rammies Exquisite Home With Pool Access",
    guests: 9,
    bedrooms: 4,
    beds: 4,
    bathrooms: 3,
    description:
      "Make some memories at this unique and family friendly place. Experience the perfect home away at this beautiful 4 bedroom, 3-bathroom vacation and short-term rental! Located near top attractions such as Typhoon Water Park, Katy Mills Mall and Main Event. This home is fully equipped with kitchen, covered patio where you can sit and enjoy with family. Enjoy seasonal outdoor pool access, a fitness center, and tennis courts. This is the ideal house for your vacation.",
    amenities: [
      "Bathtub", "Hair Dryer", "Cleaning Products", "Shampoo",
      "Conditioner", "Body Soap", "Hot Water", "Shower Gel",
      "Washer", "Dryer", "Essentials (Towels, bed sheets, soap, toilet paper)",
      "Hangers", "Bed Linens", "Extra Pillows and Blankets",
      "Room-Darkening Shades", "Iron", "Drying Rack",
      "Safe", "Clothing Storage",
      "Ethernet Connection", "TV", "Sound System",
      "Books and Reading Material",
      "Crib", "Outlet Covers",
      "Air Conditioning", "Ceiling Fan", "Central Heating",
      "Exterior Security Cameras", "Smoke Alarm",
      "Carbon Monoxide Alarm", "Fire Extinguisher", "First Aid Kit",
      "WiFi", "Dedicated Workspace",
      "Kitchen", "Refrigerator", "Microwave", "Cooking Basics",
      "Dishes and Silverware", "Freezer", "Dishwasher",
      "Gas Stove", "Stainless Steel Oven", "Hot Water Kettle",
      "Coffee Maker", "Wine Glasses", "Toaster", "Baking Sheet",
      "Blender", "Trash Compactor", "Barbecue Utensils",
      "Dining Table", "Coffee",
      "Laundromat Nearby",
      "Private Patio or Balcony", "Backyard", "Fire Pit",
      "Outdoor Furniture", "Outdoor Dining Area", "BBQ Grill",
      "Free Parking on Premises", "Single Level Home",
      "Long Term Stays Allowed", "Self Check-In", "Smart Lock",
    ],
    skipReviews: true,
  },

  {
    name: "3BR Corporate and Family Getaway Near Katy Mills",
    guests: 7,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3, // 2.5 rounded
    description:
      "Make some memories at this unique and family-friendly place that is ideal for corporate travelers and families relocating to Houston. Whether you are part of a business team in town for work or a family transitioning to a new home, our spacious 3-bedroom, 2.5-bathroom property offers the perfect balance of comfort and convenience. Designed to host up to 7 guests, it's the perfect home base for extended stays, team housing, vacations, and family relocation. Also, get a discount for longer stays.",
    amenities: [
      "Hair Dryer", "Cleaning Products", "Shampoo", "Conditioner",
      "Body Soap", "Hot Water", "Shower Gel",
      "Washer", "Dryer", "Essentials (Towels, bed sheets, soap, toilet paper)",
      "Hangers", "Bed Linens", "Extra Pillows and Blankets",
      "Room-Darkening Shades", "Iron", "Drying Rack",
      "Clothing Storage",
      "TV",
      "Crib",
      "Air Conditioning", "Ceiling Fan", "Central Heating",
      "Exterior Security Cameras", "Smoke Alarm",
      "Carbon Monoxide Alarm", "Fire Extinguisher", "First Aid Kit",
      "WiFi", "Dedicated Workspace",
      "Kitchen", "Refrigerator", "Microwave",
      "Cooking Basics", "Freezer", "Dishwasher",
      "Stainless Steel Gas Stove", "Stainless Steel Single Oven",
      "Hot Water Kettle", "Coffee Maker", "Wine Glasses",
      "Toaster", "Blender", "Trash Compactor",
      "Barbecue Utensils", "Dining Table", "Coffee",
      "Private Entrance",
      "Hammock", "Outdoor Dining Area", "Sun Loungers",
      "Free Parking on Premises",
      "Pets Allowed", "Long Term Stays Allowed",
      "Self Check-In", "Keypad",
    ],
    reviews: [
      {
        guestName: "Augustine",
        guestLocation: "Murrieta, California",
        rating: 5,
        comment:
          "If you are visiting Katy and looking for an Airbnb to stay, I will say by far this is one of the best Airbnbs to stay with family. It felt like home away from home. Francisca's customer service was superb. The place was exactly as described and response to my questions was almost simultaneous. The house is very clean in a peaceful and quiet neighborhood. I will definitely use the place again.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Zain",
        guestLocation: null,
        rating: 5,
        comment: "Great host, so accommodating. Now I have a great place to visit in Katy.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Jorge",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment:
          "We had an amazing stay; the place is great and very clean. We will come back for sure. Francisca was always available for us.",
        reviewDate: "2025-10-15",
      },
      {
        guestName: "Mariana",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment:
          "I loved the place, very clean and area feels safe. Host is very nice and the communication is very quick. The place is clean and very cozy. I will come back for sure!",
        reviewDate: "2025-09-15",
      },
      {
        guestName: "Varadachari Sudan",
        guestLocation: "Suwanee, Georgia",
        rating: 5,
        comment:
          "It was a great stay. The place was clean, matched the description, and was perfect for our family. We would like to come back again.",
        reviewDate: "2025-09-15",
      },
      {
        guestName: "Jantsen",
        guestLocation: null,
        rating: 5,
        comment: "Great place to stay!",
        reviewDate: "2026-01-15",
      },
    ],
  },

  {
    name: "Rammies Cozy Home With Community Pool",
    guests: 7,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    description:
      "Escape to this brand new stylish 3-bedroom retreat in the heart of Fulshear, where comfort meets charm. With 2 sparkling baths, a cozy open living space, and a fully stocked kitchen, this home is ready to host your next getaway. Step outside to a private patio — perfect for sipping morning coffee or unwinding under the stars. Whether you're visiting for a family trip, a weekend with friends, or a peaceful work vacation, this home offers the perfect blend of relaxation and convenience.",
    amenities: [
      "Hair Dryer", "Cleaning Products", "Shampoo", "Conditioner",
      "Body Soap", "Hot Water", "Shower Gel",
      "Washer", "Dryer", "Essentials (Towels, bed sheets, soap, toilet paper)",
      "Hangers", "Bed Linens", "Extra Pillows and Blankets",
      "Room-Darkening Shades", "Iron", "Drying Rack",
      "Clothing Storage",
      "Ethernet Connection", "TV", "Books and Reading Material",
      "Crib", "Children's Books and Toys",
      "Air Conditioning", "Central Heating",
      "Exterior Security Cameras", "Smoke Alarm",
      "Carbon Monoxide Alarm", "Fire Extinguisher", "First Aid Kit",
      "WiFi",
      "Kitchen", "Refrigerator", "Microwave", "Cooking Basics",
      "Dishes and Silverware", "Freezer", "Dishwasher",
      "Stove", "Stainless Steel Oven", "Hot Water Kettle",
      "Coffee Maker", "Wine Glasses", "Toaster", "Baking Sheet",
      "Blender", "Trash Compactor", "Barbecue Utensils",
      "Dining Table", "Coffee",
      "Patio or Balcony", "Backyard", "Outdoor Furniture",
      "Outdoor Dining Area", "BBQ Grill",
      "Free Parking on Premises", "Pool", "Elevator",
      "Single Level Home",
      "Long Term Stays Allowed", "Self Check-In", "Keypad",
    ],
    reviews: [
      {
        guestName: "Cameron",
        guestLocation: null,
        rating: 5,
        comment:
          "Top stay and host. We felt right at home in Tamarron. The house is well spaced and was great accommodation for our family with kids. Many places for kids to play and to grab food/groceries. We cannot wait to come back.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Jesse Garcia Jr",
        guestLocation: null,
        rating: 5,
        comment: "I had a great stay. The place was clean and nice. Francisca is a great host.",
        reviewDate: "2026-02-15",
      },
      {
        guestName: "Jose",
        guestLocation: "Katy, Texas",
        rating: 5,
        comment:
          "Amazing and beautiful home, just like described in the pictures. Francisca provided all the instructions and recommendations and was really responsive. We will definitely stay again in this property in the future. 100% Recommended.",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Don",
        guestLocation: "Murphy, Texas",
        rating: 5,
        comment: "Great Price and Location especially for what I needed. Will definitely stay here again.",
        reviewDate: "2025-12-15",
      },
      {
        guestName: "Cindi",
        guestLocation: "Bastrop, Texas",
        rating: 5,
        comment: "Location was convenient to family event. Safe and quiet neighborhood.",
        reviewDate: "2025-11-15",
      },
      {
        guestName: "Miguel",
        guestLocation: null,
        rating: 5,
        comment: "Very polite host, very easy to communicate and respectful.",
        reviewDate: "2025-11-15",
      },
      {
        guestName: "Wade",
        guestLocation: "San Antonio, Texas",
        rating: 5,
        comment: "Brand new home in a very safe neighborhood.",
        reviewDate: "2025-04-15",
      },
      {
        guestName: "Jeff",
        guestLocation: "Katy, Texas",
        rating: 5,
        comment: "All was great as we enjoyed our stay, thanks!",
        reviewDate: "2025-07-15",
      },
      {
        guestName: "Jodi",
        guestLocation: "New Braunfels, Texas",
        rating: 5,
        comment:
          "Our son lives in Katy. When there is a big event we like to book a place. We have stayed at 2 of Francisca's properties and they are always clean and comfortable.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Zenia",
        guestLocation: "Monterrey, Mexico",
        rating: 5,
        comment: "My family's stay here at Francisca's house was very pleasant, a quiet and safe place!",
        reviewDate: "2026-01-15",
      },
      {
        guestName: "Keiyana",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment:
          "Absolutely loved everything about the home. Very clean and comfortable. My family really enjoyed the space. Would recommend to anyone.",
        reviewDate: "2025-04-15",
      },
      {
        guestName: "Jeff",
        guestLocation: null,
        rating: 5,
        comment:
          "Amazing place to stay! Super clean and great neighborhood! Host was amazing and very quick to reply! Will definitely stay here again!",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Adeola",
        guestLocation: null,
        rating: 5,
        comment: "Truly enjoyed my stay, great host.",
        reviewDate: "2025-04-15",
      },
    ],
  },

  {
    name: "Exquisite Relocation and Workers Dream Place",
    guests: 7,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3, // 2.5 rounded
    description:
      "Perfect Stay for Companies and Corporations Visiting Houston for Work! Spacious enough to comfortably accommodate teams of up to 7 people, our home is ideal for both business groups and families in need of temporary housing. Relocation companies are welcome to book. Welcome to our spacious and inviting 3-bedroom, 2.5-bathroom home with 3 beds and a twin mattress and equipped kitchen making it perfect for families or groups of friends. Make Memories at this place.",
    amenities: [
      "Hair Dryer", "Cleaning Products", "Shampoo", "Conditioner",
      "Body Soap", "Hot Water", "Shower Gel",
      "Washer", "Dryer", "Essentials (Towels, bed sheets, soap, toilet paper)",
      "Hangers", "Bed Linens", "Extra Pillows and Blankets",
      "Room-Darkening Shades", "Iron", "Drying Rack",
      "Clothing Storage (Walk-in Closet, Closet, and Dresser)",
      "Ethernet Connection", "TV",
      "Crib",
      "Central Air Conditioning", "Ceiling Fan", "Heating",
      "Exterior Security Cameras", "Smoke Alarm",
      "Carbon Monoxide Alarm", "Fire Extinguisher", "First Aid Kit",
      "WiFi", "Dedicated Workspace",
      "Kitchen", "Refrigerator", "Microwave", "Cooking Basics",
      "Dishes and Silverware", "Freezer", "Dishwasher",
      "Electric Stove", "Oven", "Hot Water Kettle",
      "Coffee Maker", "Wine Glasses", "Toaster", "Blender",
      "Trash Compactor", "Dining Table", "Coffee",
      "Private Entrance",
      "Private Patio or Balcony", "Outdoor Dining Area",
      "Free Parking on Premises",
      "Pets Allowed", "Long Term Stays Allowed",
      "Self Check-In", "Keypad",
    ],
    reviews: [
      {
        guestName: "Laterial",
        guestLocation: "Baton Rouge, Louisiana",
        rating: 5,
        comment:
          "Everything was perfect! The home was neat and clean and we never had to worry about running out of towels. Checking in and out was easy. Francisca was very responsive and thorough in her communication.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Wendy",
        guestLocation: "Lewisville, Texas",
        rating: 5,
        comment:
          "My family had a very quick trip and with a brand new grandson, we needed a house compared to a hotel. Francisca's townhouse was perfect! It had everything we needed, very clean and extremely comfortable beds! If we're ever in the area, we will definitely come back again!",
        reviewDate: "2025-12-15",
      },
      {
        guestName: "Rosideth",
        guestLocation: "Tulsa, Oklahoma",
        rating: 5,
        comment:
          "House was perfect! Even more beautiful than the pictures suggest. It was impeccably clean, stylishly decorated, and felt instantly cozy. We loved the location of this property. Francisca was an absolute gem. Communication was instant, she was always in touch and provided clear instructions for check-in and check-out. We will definitely book it again!",
        reviewDate: "2025-11-15",
      },
      {
        guestName: "Lauren",
        guestLocation: "Geismar, Louisiana",
        rating: 5,
        comment: "She confirmed the booking very quickly. Location was great. House was very clean.",
        reviewDate: "2025-04-15",
      },
      {
        guestName: "Nizar",
        guestLocation: "Amman, Jordan",
        rating: 5,
        comment:
          "We stayed at Francisca's property as a family, and she was a friendly and welcoming host who went above and beyond to make us feel comfortable. She was highly responsive and proactive. It was a pleasure to experience such attentive hospitality.",
        reviewDate: "2025-07-15",
      },
      {
        guestName: "Anthony",
        guestLocation: null,
        rating: 5,
        comment:
          "Perfect for 3 adults for the weekend. Close by to the Katy shopping area and the residential developments. Very roomy and clean, beds were comfortable, and we would definitely stay again!",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Juan",
        guestLocation: "Brighton, Colorado",
        rating: 5,
        comment: "The house is super clean, the location is perfect to anywhere you want to reach.",
        reviewDate: "2025-12-15",
      },
      {
        guestName: "Felipe",
        guestLocation: null,
        rating: 5,
        comment:
          "Stayed there for 3 weeks with my family, very clean house, owner proactive in communicating and answering questions. Very happy and strongly recommend.",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Jesus Iii",
        guestLocation: "Cibolo, Texas",
        rating: 5,
        comment: "Great home with a proactive host. Would definitely stay again.",
        reviewDate: "2025-06-15",
      },
      {
        guestName: "Iwani",
        guestLocation: null,
        rating: 5,
        comment:
          "Perfect for what we needed. 3 couples in Katy for a wedding. House was perfectly clean and new. All went smoothly and well.",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Adrienne",
        guestLocation: "Shreveport, Louisiana",
        rating: 5,
        comment: "This place was great for our group of six. Would absolutely book again.",
        reviewDate: "2025-10-15",
      },
      {
        guestName: "Richard And Gabby",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment:
          "Francisca is probably the best host we ever had. Checked on us, made sure we were comfortable and cared how we felt while staying with her. The place felt like home and it was very comfortable and cozy. We would have stayed another week if our plans didn't change. Very clean and the amenities were great!",
        reviewDate: "2025-02-15",
      },
      {
        guestName: "Brian",
        guestLocation: "Fairfield, Iowa",
        rating: 5,
        comment: "Great place and great host! Highly recommend.",
        reviewDate: "2025-10-15",
      },
      {
        guestName: "Miriam",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment:
          "This stay was absolutely fantastic! The house was spotless, beautiful, and even better than the photos. It was incredibly comfortable, and my family was so happy throughout our visit. The location was perfect, with so many things nearby. Francisca was super responsive, kind, and friendly. The house felt brand new and had everything we needed. I will definitely stay here again. Highly recommended!",
        reviewDate: "2025-01-15",
      },
      {
        guestName: "Avery",
        guestLocation: "Dallas, Texas",
        rating: 5,
        comment:
          "This was a great stay for the price and location. We were looking for something clean, safe, and close to our in-laws for Thanksgiving and Francisca's place did not disappoint!",
        reviewDate: "2024-11-15",
      },
      {
        guestName: "Elisa",
        guestLocation: null,
        rating: 5,
        comment: "The apartment is exactly as shown in the photos. All new and very tasteful. I will definitely stay again.",
        reviewDate: "2025-11-15",
      },
      {
        guestName: "Christopher",
        guestLocation: null,
        rating: 5,
        comment: "This was an excellent stay. Location is perfect. Clean and new.",
        reviewDate: "2024-10-15",
      },
      {
        guestName: "Cristine",
        guestLocation: "Colleyville, Texas",
        rating: 5,
        comment: "New, very nice and clean! Had everything we needed.",
        reviewDate: "2024-11-15",
      },
      {
        guestName: "Carlos",
        guestLocation: null,
        rating: 5,
        comment: "Everything was great.",
        reviewDate: "2026-01-15",
      },
      {
        guestName: "Denzell",
        guestLocation: "Avondale, Louisiana",
        rating: 5,
        comment: "Wonderful spot, loved it, wonderful host.",
        reviewDate: "2025-04-15",
      },
      {
        guestName: "Naomi",
        guestLocation: "Magnolia, Texas",
        rating: 5,
        comment: "Absolutely beautiful home, I would definitely stay again.",
        reviewDate: "2025-01-15",
      },
    ],
  },

  {
    name: "Exquisite 3 Bedroom House in Katy With Pool Access",
    guests: 8,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    description:
      "Make some memories at this unique and family-friendly place. Experience the perfect home away at this beautiful 3 bedroom, 2 bathroom vacation and short term rental! Located near top attractions such as Typhoon Waterpark, Katy Mills and Main Event Center. This house is fully equipped with kitchen, covered patio where you can relax and enjoy with your family. This is the ideal house for your vacation.",
    amenities: [
      "Hair Dryer", "Cleaning Products", "Shampoo", "Conditioner",
      "Body Soap", "Hot Water", "Shower Gel",
      "Washer", "Dryer", "Essentials (Towels, bed sheets, soap, toilet paper)",
      "Hangers", "Bed Linens", "Extra Pillows and Blankets",
      "Room-Darkening Shades", "Iron",
      "Clothing Storage (Walk-in Closet and Dresser)",
      "TV",
      "Paid Crib",
      "Air Conditioning", "Central Heating",
      "Exterior Security Cameras", "Smoke Alarm",
      "Carbon Monoxide Alarm", "Fire Extinguisher", "First Aid Kit",
      "WiFi", "Dedicated Workspace with Monitor and Ergonomic Chair",
      "Kitchen", "Refrigerator", "Microwave", "Cooking Basics",
      "Dishes and Silverware", "Freezer", "Dishwasher",
      "Gas Stove", "Stainless Steel Oven", "Hot Water Kettle",
      "Espresso Machine", "Wine Glasses", "Toaster", "Blender",
      "Trash Compactor", "Dining Table", "Coffee",
      "Private Patio or Balcony", "Private Backyard (Fully Fenced)",
      "Free Parking on Premises", "Single Level Home",
      "Pets Allowed", "Long Term Stays Allowed",
      "Self Check-In", "Smart Lock",
    ],
    reviews: [
      {
        guestName: "Keith",
        guestLocation: null,
        rating: 5,
        comment:
          "Francisca was always very responsive and willing to work with us to accommodate our client. Her home was in excellent condition and our client loved it. If possible, we'd love to book her place in the future whenever we have requests in her area.",
        reviewDate: "2026-02-15",
      },
      {
        guestName: "Carrie",
        guestLocation: "Carrollton, Texas",
        rating: 5,
        comment:
          "Great home with cozy and warm decor. I felt like I was at home with all the benefits of being away. Very responsive about a request and I would definitely book again.",
        reviewDate: "2025-07-15",
      },
      {
        guestName: "Lucia",
        guestLocation: "Texas, United States",
        rating: 5,
        comment:
          "Francisca's home was beautiful. Spotless, comfortable and in a quiet neighborhood. The area was exactly what we needed as it was minutes from family and the interstate as well as restaurants. We recommend this home to all!",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Michael",
        guestLocation: "Fulshear, Texas",
        rating: 5,
        comment: "Clean house, safe area, nice house, well equipped.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Shawna",
        guestLocation: null,
        rating: 5,
        comment:
          "We had booked a place but had a family emergency and canceled hours before our flight to my brother's wedding! Francisca was promptly communicating with me and was able to book us in last minute. We were extremely grateful.",
        reviewDate: "2025-06-15",
      },
      {
        guestName: "Joseph",
        guestLocation: null,
        rating: 5,
        comment:
          "Really enjoyed the stay here! Beautiful new house in a great location and the host was excellent as well. 5 stars all the way. Highly recommend.",
        reviewDate: "2025-07-15",
      },
      {
        guestName: "Joe",
        guestLocation: "San Antonio, Texas",
        rating: 5,
        comment: "Great place to stay!",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Peter",
        guestLocation: "Hutchinson, Kansas",
        rating: 5,
        comment: "Great place and host. No complaints at all!",
        reviewDate: "2026-01-15",
      },
      {
        guestName: "Jamie",
        guestLocation: null,
        rating: 4,
        comment:
          "Enjoyed my stay! Super plus having the yard for the dog and the use of the garage. The place was cozy and looked like the listing. This area of Katy is great for walking since most of the communities are connected by walkways.",
        reviewDate: "2024-11-15",
      },
      {
        guestName: "Camilo",
        guestLocation: "Salt Lake City, Utah",
        rating: 5,
        comment: "Very comfortable house. Pleasant.",
        reviewDate: "2025-06-15",
      },
      {
        guestName: "Ernst",
        guestLocation: "Katy, Texas",
        rating: 4,
        comment:
          "Francisca's place is perfect for families. We were even allowed to bring our dog which made the stay very convenient. Francisca was also very responsive during our check in process.",
        reviewDate: "2024-12-15",
      },
      {
        guestName: "Mason",
        guestLocation: "Dallas, Texas",
        rating: 5,
        comment:
          "Roomy house in a quiet neighborhood. Easy instructions and very communicative host. Will definitely stay here again.",
        reviewDate: "2025-04-15",
      },
      {
        guestName: "Steve",
        guestLocation: "Katy, Texas",
        rating: 5,
        comment: "Great location for needs and very clean place that was extremely comfortable.",
        reviewDate: "2025-01-15",
      },
      {
        guestName: "Kelly",
        guestLocation: "Lubbock, Texas",
        rating: 5,
        comment:
          "Great place to stay! There were a few issues, nothing outside of normal things that arise, but Francisca was prompt with responses and assistance!",
        reviewDate: "2024-07-15",
      },
      {
        guestName: "Richard",
        guestLocation: "Lewisville, Texas",
        rating: 5,
        comment: "Perfect place for my family and dogs.",
        reviewDate: "2024-05-15",
      },
      {
        guestName: "Rafael",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment:
          "Great place, very convenient location for us, we have family in the same neighborhood.",
        reviewDate: "2024-04-15",
      },
      {
        guestName: "Asit",
        guestLocation: "Austin, Texas",
        rating: 5,
        comment: "Good communication throughout the process.",
        reviewDate: "2024-11-15",
      },
      {
        guestName: "Nakia",
        guestLocation: "Arlington, Texas",
        rating: 5,
        comment:
          "Great home and location. Francisca was very communicative and made herself available for any and all questions. She even dropped off a blender and extra detergent for us. The home was clean and beautifully decorated with a large yard for our two dogs to enjoy. The beds were very comfortable. We will definitely book again.",
        reviewDate: "2024-03-15",
      },
      {
        guestName: "Kyu",
        guestLocation: "Fulshear, Texas",
        rating: 5,
        comment:
          "My family stayed for four days and were completely satisfied. Very quiet and clean. Everything as described. We had a problem with the internet connection but Francisca helped us right away. She is very responsive and friendly. I'll definitely come back.",
        reviewDate: "2024-02-15",
      },
      {
        guestName: "Jessica",
        guestLocation: null,
        rating: 5,
        comment:
          "Easy and convenient spot where we stayed while our house was painted. Very clean. Francisca was very responsive.",
        reviewDate: "2024-04-15",
      },
      {
        guestName: "Christopher",
        guestLocation: "Baytown, Texas",
        rating: 5,
        comment:
          "Great home, very clean and everything looking very fresh and new. Owner responds actively on time. Good and great neighborhood. You will love it.",
        reviewDate: "2023-12-15",
      },
      {
        guestName: "Jared",
        guestLocation: "Fulshear, Texas",
        rating: 5,
        comment: "Very nice property and host. Would definitely stay there again.",
        reviewDate: "2024-04-15",
      },
      {
        guestName: "Antonide",
        guestLocation: "Fort Lauderdale, Florida",
        rating: 5,
        comment: "My stay with my family was very comfortable. We felt right at home.",
        reviewDate: "2024-01-15",
      },
      {
        guestName: "Sandi",
        guestLocation: "Lawrenceville, Georgia",
        rating: 5,
        comment: "Great, clean and beautifully decorated house.",
        reviewDate: "2024-02-15",
      },
      {
        guestName: "Rachel",
        guestLocation: null,
        rating: 5,
        comment: "Place was very clean, beds were very comfortable.",
        reviewDate: "2024-01-15",
      },
      {
        guestName: "William",
        guestLocation: "Las Vegas, Nevada",
        rating: 5,
        comment: "Great stay! Nice beds! Very kind host!",
        reviewDate: "2023-12-15",
      },
      {
        guestName: "Breion",
        guestLocation: null,
        rating: 5,
        comment: "Francisca was very welcoming and responsive.",
        reviewDate: "2024-03-15",
      },
      {
        guestName: "Diana",
        guestLocation: null,
        rating: 5,
        comment:
          "Beautiful House! Very clean and comfortable, all the necessary services for a short or long stay, the neighborhood is very quiet! I would definitely stay with Francisca again.",
        reviewDate: "2024-03-15",
      },
      {
        guestName: "Sandi",
        guestLocation: "Lawrenceville, Georgia",
        rating: 5,
        comment: "Great home away from home!!!!",
        reviewDate: "2024-01-15",
      },
    ],
  },

  {
    name: "Stylish 3 Bedroom Oasis Near Katy Mills",
    guests: 7,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3, // 2.5 rounded
    description:
      "Welcome to this stylish house that is ideal for corporate travelers and families relocating to Houston. Whether you're part of a business team in town for work or a family transitioning to a new home, our spacious 3-bedroom, 2.5-bathroom property offers the perfect balance of comfort and convenience. Designed to host up to 7 guests, it's the perfect home base for extended stays, team housing, vacations, and family relocation. When you book one month or more you receive a 10% discount!",
    amenities: [
      "Hair Dryer", "Cleaning Products", "Shampoo", "Conditioner",
      "Body Soap", "Hot Water", "Shower Gel",
      "Washer", "Dryer", "Essentials (Towels, bed sheets, soap, toilet paper)",
      "Hangers", "Bed Linens", "Extra Pillows and Blankets",
      "Room-Darkening Shades", "Iron", "Drying Rack",
      "Safe", "Clothing Storage (Walk-in Closet and Dresser)",
      "TV", "Books and Reading Material",
      "Crib", "Children's Books and Toys", "Board Games",
      "Central Air Conditioning", "Ceiling Fan", "Central Heating",
      "Exterior Security Cameras", "Smoke Alarm",
      "Carbon Monoxide Alarm", "Fire Extinguisher", "First Aid Kit",
      "WiFi", "Dedicated Workspace",
      "Kitchen", "Refrigerator", "Microwave", "Cooking Basics",
      "Dishes and Silverware", "Mini Fridge", "Dishwasher",
      "Gas Stove", "Oven", "Hot Water Kettle", "Coffee Maker",
      "Wine Glasses", "Toaster", "Baking Sheet", "Blender",
      "Trash Compactor", "Barbecue Utensils", "Dining Table",
      "Coffee", "Bread Maker",
      "Backyard", "BBQ Grill",
      "Free Parking on Premises", "Free Street Parking",
      "Pets Allowed", "Long Term Stays Allowed",
      "Self Check-In", "Keypad",
    ],
    reviews: [
      {
        guestName: "Emily",
        guestLocation: "Georgetown, Texas",
        rating: 5,
        comment:
          "Easy to get to and convenient location to I-10. Comfortable accommodations in terms of beds and bathrooms. Francisca was very responsive before, during and after our stay.",
        reviewDate: "2025-11-15",
      },
      {
        guestName: "Jacob",
        guestLocation: "Tulsa, Oklahoma",
        rating: 5,
        comment:
          "Francisca's place was super convenient near I-10 and Katy Mills. Lots of space and comfortable beds. Great for our family of 6.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Christina",
        guestLocation: "Katy, Texas",
        rating: 5,
        comment:
          "Francisca is truly heaven sent. She was very clear and communicative. Extremely friendly and approachable host. The space was incredible. I am very grateful for the time spent. 10/10 highly recommend staying here.",
        reviewDate: "2025-09-15",
      },
      {
        guestName: "Aubrey",
        guestLocation: "Monroe, North Carolina",
        rating: 5,
        comment: "We had a very comfortable stay and would definitely stay again!",
        reviewDate: "2026-01-15",
      },
      {
        guestName: "Andrew",
        guestLocation: "San Antonio, Texas",
        rating: 5,
        comment: "Good.",
        reviewDate: "2026-04-15",
      },
      {
        guestName: "Ronnika Hawkins",
        guestLocation: "Cleveland, Ohio",
        rating: 5,
        comment: "Great house, highly recommend.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Brian",
        guestLocation: "Fairfield, Iowa",
        rating: 5,
        comment: "Great place and great host!",
        reviewDate: "2025-11-15",
      },
      {
        guestName: "Ya'Ron",
        guestLocation: "Arabi, Louisiana",
        rating: 5,
        comment: "The host and home were both amazing!",
        reviewDate: "2025-07-15",
      },
    ],
  },

  {
    name: "Exquisite 4 Bedroom House in Katy with Pool Access",
    guests: 9,
    bedrooms: 4,
    beds: 4,
    bathrooms: 2,
    description:
      "Make some memories at this unique and family friendly place. Experience the perfect home away at this beautiful 4 bedroom, 2 bathroom vacation and short-term rental! Located near top attractions such as Typhoon Water Park, Katy Mills Mall and Main Event. This home is fully equipped with kitchen, covered patio where you can sit and enjoy with family. Enjoy seasonal outdoor pool access, a fitness center, and tennis courts. This is the ideal house for your vacation.",
    amenities: [
      "Hair Dryer", "Cleaning Products", "Shampoo", "Conditioner",
      "Body Soap", "Hot Water", "Shower Gel",
      "Washer", "Dryer", "Essentials (Towels, bed sheets, soap, toilet paper)",
      "Hangers", "Bed Linens", "Extra Pillows and Blankets",
      "Room-Darkening Shades", "Iron", "Safe",
      "Clothing Storage (Walk-in Closet, Closet, and Dresser)",
      "TV",
      "Crib",
      "Air Conditioning", "Central Heating",
      "Exterior Security Cameras", "Smoke Alarm",
      "Carbon Monoxide Alarm", "Fire Extinguisher", "First Aid Kit",
      "WiFi", "Dedicated Workspace",
      "Kitchen", "Refrigerator", "Microwave", "Cooking Basics",
      "Dishes and Silverware", "Dishwasher", "Electric Stove",
      "Oven", "Hot Water Kettle", "Espresso Machine",
      "Wine Glasses", "Toaster", "Baking Sheet", "Blender",
      "Rice Maker", "Trash Compactor", "Barbecue Utensils",
      "Dining Table", "Coffee",
      "Private Patio or Balcony", "Private Backyard (Fully Fenced)",
      "Outdoor Furniture",
      "Free Parking on Premises", "Paid Parking Garage (2 Spaces)",
      "Pets Allowed", "Long Term Stays Allowed",
      "Self Check-In", "Keypad",
    ],
    reviews: [
      {
        guestName: "Eleanor",
        guestLocation: "Fulshear, Texas",
        rating: 5,
        comment:
          "I'm originally from the area but was back to spend time with family. The house was well maintained, very comfortable and easy access to the highway. The host was very friendly and responsive. Each communication with her was polite and timely. I highly recommend this house for a family especially if you want to feel at home.",
        reviewDate: "2025-07-15",
      },
      {
        guestName: "Rich",
        guestLocation: null,
        rating: 5,
        comment:
          "Francisca is a great host, extremely responsive. The exquisite home was exactly what you see in the photos and felt like a home away from home.",
        reviewDate: "2025-12-15",
      },
      {
        guestName: "Chau",
        guestLocation: "Indianapolis, Indiana",
        rating: 5,
        comment:
          "Great house! Exactly what we needed for the trip. Host was friendly and very responsive. We walked the neighborhood a few times, it seemed nice and safe. Would definitely stay here again the next time we're in town to visit family.",
        reviewDate: "2025-10-15",
      },
      {
        guestName: "Christina",
        guestLocation: "Galena, Ohio",
        rating: 5,
        comment: "Host was very helpful and friendly.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Chance",
        guestLocation: "Dallas, Texas",
        rating: 5,
        comment: "Nice place.",
        reviewDate: "2026-02-15",
      },
      {
        guestName: "Jane",
        guestLocation: "Madison, Wisconsin",
        rating: 5,
        comment:
          "We had a great stay! The place is clean and well organized, as well as comfortable! Would totally recommend!",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Tya",
        guestLocation: null,
        rating: 5,
        comment: "I loved everything about my stay, I loved the way it was decorated, very clean.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Warren",
        guestLocation: "Kent, Washington",
        rating: 5,
        comment: "Great host!",
        reviewDate: "2024-11-15",
      },
    ],
  },

  {
    name: "Elegant 4 Bedroom with High Speed WiFi in Katy",
    guests: 9,
    bedrooms: 4,
    beds: 4,
    bathrooms: 3,
    description:
      "Discover the ultimate retreat at this brand new 4-bedroom, 3-bathroom vacation home! Situated in close proximity to popular destinations like Katy Mills Mall, Typhoon Texas Waterpark and city center. This home provides the perfect hub for exploring the Houston area. Unwind on the sheltered patio or prepare a delightful meal in the well-equipped kitchen before gathering around the dining table. With generous space and a convenient setting, this residence is the perfect option for your Katy getaway.",
    amenities: [
      "Bathtub", "Hair Dryer", "Cleaning Products", "Shampoo",
      "Conditioner", "Body Soap", "Hot Water", "Shower Gel",
      "Washer", "Dryer", "Essentials (Towels, bed sheets, soap, toilet paper)",
      "Hangers", "Bed Linens", "Extra Pillows and Blankets",
      "Room-Darkening Shades", "Iron",
      "Clothing Storage (Walk-in Closet, Closet, and Dresser)",
      "TV",
      "Crib",
      "Air Conditioning", "Central Heating",
      "Exterior Security Cameras", "Smoke Alarm",
      "Carbon Monoxide Alarm", "Fire Extinguisher", "First Aid Kit",
      "WiFi", "Dedicated Workspace",
      "Kitchen", "Refrigerator", "Microwave", "Cooking Basics",
      "Dishes and Silverware", "Dishwasher", "Gas Stove",
      "Stainless Steel Single Oven", "Hot Water Kettle",
      "Coffee Maker", "Wine Glasses", "Toaster", "Blender",
      "Dining Table", "Coffee",
      "Laundromat Nearby",
      "Private Patio or Balcony", "Private Backyard (Fully Fenced)",
      "Outdoor Furniture", "Outdoor Dining Area",
      "Free Parking on Premises", "Single Level Home",
      "Pets Allowed", "Long Term Stays Allowed",
      "Self Check-In", "Keypad",
    ],
    reviews: [
      {
        guestName: "Charles",
        guestLocation: "Galveston, Texas",
        rating: 5,
        comment:
          "Francisca's house was excellent! We really liked the decor of the house. Everything was immaculate! The beds were really comfortable and there was a mixture of firm and soft pillows. There are a lot of restaurants and stores really close by. One of the things that really stuck out was she left instructions on the desk for everything about the house. If you are heading to Katy for something I recommend staying here.",
        reviewDate: "2026-02-15",
      },
      {
        guestName: "Mollie",
        guestLocation: null,
        rating: 5,
        comment:
          "The house was perfect for my family of 6. We were in town for a wedding. The location was great and close to restaurants and shopping. We will definitely stay here again!",
        reviewDate: "2026-02-15",
      },
      {
        guestName: "Shameka",
        guestLocation: "Brandon, Mississippi",
        rating: 5,
        comment:
          "I stayed at Francisca's place during Christmas and it did not disappoint. Everything was very clean. Looked like photos. The beds and pillows were comfortable. We had extra towels. We did not want for anything. Check-in was smooth and easy. Instructions were easy to follow. Plenty of room and space for our family. Will definitely book with her again.",
        reviewDate: "2025-12-15",
      },
      {
        guestName: "Amisha",
        guestLocation: null,
        rating: 5,
        comment: "Great location and clear instructions! Wonderful house with lots of space! Great host.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Dylan",
        guestLocation: null,
        rating: 5,
        comment: "Beautiful and spacious house. I'm recommending it to everyone!",
        reviewDate: "2026-02-15",
      },
      {
        guestName: "Rudy",
        guestLocation: "San Francisco, California",
        rating: 5,
        comment:
          "Comfortable and spacious 4BR with two en suite bathrooms plus a full third bathroom. Perfect for families with a teenager needing their own space.",
        reviewDate: "2025-12-15",
      },
      {
        guestName: "Gregory",
        guestLocation: null,
        rating: 5,
        comment: "Beautiful home in a nice neighborhood. Francisca is a responsive, friendly host. Thanks for the stay!",
        reviewDate: "2025-12-15",
      },
      {
        guestName: "Tandrea",
        guestLocation: "Southaven, Mississippi",
        rating: 5,
        comment:
          "My family and I really enjoyed our stay. The home was so beautiful and very clean! Everything looked exactly how it did in the photos! Lots of restaurants close by and easy interstate access! 10/10",
        reviewDate: "2025-10-15",
      },
      {
        guestName: "Donna",
        guestLocation: null,
        rating: 5,
        comment:
          "We were in Katy for a relative's graduation and wanted a place to accommodate our family and close to where our relatives live. This house was exactly what we needed. Everyone had their own bedroom and the common area was perfect for all of us to relax. The house was immaculate. The bathrooms were very clean and well stocked. We will definitely use it if we are in Katy again.",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Aspen",
        guestLocation: "Atlanta, Georgia",
        rating: 5,
        comment:
          "Francisca was an amazing host. When I come back I will be staying in one of her homes. Thank you again! Book with her!",
        reviewDate: "2025-12-15",
      },
      {
        guestName: "Amit",
        guestLocation: "Coppell, Texas",
        rating: 5,
        comment: "Great location, very peaceful and well maintained.",
        reviewDate: "2026-01-15",
      },
      {
        guestName: "Tammie",
        guestLocation: null,
        rating: 5,
        comment:
          "Thank you for allowing us to stay at your home. We felt comfortable and were able to relax. Would definitely stay again.",
        reviewDate: "2025-06-15",
      },
      {
        guestName: "Dawit",
        guestLocation: "Seattle, Washington",
        rating: 5,
        comment:
          "Beautiful house, peaceful and very nice community. Super nice neighborhood. My family and I liked the place. Good and clean house too.",
        reviewDate: "2025-04-15",
      },
      {
        guestName: "Bruce",
        guestLocation: "Fort Worth, Texas",
        rating: 5,
        comment: "Great Airbnb to stay in. We will definitely rent this one again.",
        reviewDate: "2025-06-15",
      },
      {
        guestName: "Roddy",
        guestLocation: "Greenacres, Florida",
        rating: 5,
        comment: "Great place, enjoyed the stay and would definitely stay again.",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Victoria",
        guestLocation: "New York, New York",
        rating: 5,
        comment:
          "Five star stay, all around! Our host was kind and communicative, the home was in a great location, everything was as described in the listing only better: lovely space and open floor plan with lovely amenities throughout, cozy and comfortable bedrooms, perfect living space setup, nice yard. Our family had a wonderful time together and have just found our favorite Airbnb in Houston for the next time we visit.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Rodney",
        guestLocation: null,
        rating: 5,
        comment:
          "Loved how Francisca was willing to accommodate and even extend availability to her home when our home needed emergency repairs. Beautiful home in a peaceful neighborhood! She was very helpful! Would definitely book with her again.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Cassandra",
        guestLocation: "Dallas, Georgia",
        rating: 5,
        comment:
          "The house was very clean and spacious and looked exactly like the pictures. The location was close to highways, shopping, and restaurants. Would definitely stay there again.",
        reviewDate: "2025-02-15",
      },
      {
        guestName: "Maria",
        guestLocation: "San Antonio, Texas",
        rating: 5,
        comment:
          "We needed this Airbnb on short notice for a funeral, accommodating multiple family members, and it was exactly what we needed. The four bedrooms and three bathrooms provided the perfect amount of space, and the home was in a quiet, peaceful neighborhood. The host was very receptive and even offered a discount. The house was spacious with TVs in each bedroom and comfortable mattresses. It made a difficult time a little easier.",
        reviewDate: "2025-02-15",
      },
      {
        guestName: "Fred",
        guestLocation: "Dickinson, Texas",
        rating: 5,
        comment:
          "This place was great and as advertised. The neighborhood is amazing next to anything you can imagine and the house was beautiful.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Kim",
        guestLocation: "Mansfield, Texas",
        rating: 5,
        comment: "Nice house, very clean. Host communicated very well. Would stay again.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Etosha",
        guestLocation: null,
        rating: 5,
        comment: "Love the stay, quiet and peaceful atmosphere.",
        reviewDate: "2025-04-15",
      },
      {
        guestName: "Jeff And Tina",
        guestLocation: "Champaign, Illinois",
        rating: 5,
        comment: "3 times with Francisca, love working with her!",
        reviewDate: "2024-07-15",
      },
    ],
  },
];

async function main() {
  const { prisma } = await import("../lib/prisma");

  let propertiesUpdated = 0;
  let reviewsInserted = 0;
  let errors: string[] = [];

  for (const prop of PROPERTIES) {
    try {
      const property = await prisma.property.findFirst({
        where: { name: { equals: prop.name, mode: "insensitive" } },
        select: { id: true, name: true },
      });

      if (!property) {
        console.log(`ERROR: ${prop.name} — property not found in database`);
        errors.push(prop.name);
        continue;
      }

      await prisma.property.update({
        where: { id: property.id },
        data: {
          guests: prop.guests,
          bedrooms: prop.bedrooms,
          beds: prop.beds,
          bathrooms: Math.round(prop.bathrooms),
          description: prop.description,
          amenities: prop.amenities,
        },
      });

      console.log(`Updated: ${prop.name}`);
      propertiesUpdated++;

      if (prop.skipReviews || !prop.reviews || prop.reviews.length === 0) {
        if (prop.skipReviews) {
          console.log(`Reviews skipped (already in DB): ${prop.name}`);
        }
        continue;
      }

      let inserted = 0;
      for (const review of prop.reviews) {
        const existing = await prisma.review.findFirst({
          where: { propertyId: property.id, guestName: review.guestName },
          select: { id: true },
        });

        if (existing) {
          console.log(`Skipped duplicate: ${review.guestName} for ${prop.name}`);
          continue;
        }

        await prisma.review.create({
          data: {
            propertyId: property.id,
            guestName: review.guestName,
            guestLocation: review.guestLocation,
            rating: review.rating,
            comment: review.comment,
            reviewDate: new Date(review.reviewDate),
            featured: false,
          },
        });

        inserted++;
        reviewsInserted++;
      }

      console.log(`Reviews inserted: ${inserted} for ${prop.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`ERROR: ${prop.name} — ${msg}`);
      errors.push(`${prop.name}: ${msg}`);
    }
  }

  console.log("\n=== DONE ===");
  console.log(`Properties updated: ${propertiesUpdated}/8`);
  console.log(`Reviews inserted: ${reviewsInserted} total`);
  console.log(`Errors: ${errors.length === 0 ? "None" : errors.join(", ")}`);

  await prisma.$disconnect().catch(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
