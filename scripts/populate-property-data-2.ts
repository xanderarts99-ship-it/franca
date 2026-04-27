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
  reviewsOnly?: boolean;
  guests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  description?: string;
  amenities?: string[];
  reviews: ReviewData[];
}

const PROPERTIES: PropertyData[] = [
  {
    name: "Rammies Comfy 4 Bedroom in Katy",
    guests: 9,
    bedrooms: 4,
    beds: 4,
    bathrooms: 2,
    description:
      "Make some memories at this unique and family friendly place. Experience the perfect home away at this beautiful 4 bedroom and 2 full baths for your vacation and short-term rental! Located in a quiet community in Katy near top attractions such as Typhoon Texas Water Park, Katy Mills Mall and other nice places to have fun.",
    amenities: [
      "Hair Dryer", "Cleaning Products", "Shampoo", "Conditioner",
      "Body Soap", "Hot Water", "Shower Gel",
      "Washer", "Dryer", "Essentials (Towels, bed sheets, soap, toilet paper)",
      "Hangers", "Bed Linens", "Extra Pillows and Blankets",
      "Room-Darkening Shades", "Iron", "Clothing Storage",
      "TV", "Sound System", "Books and Reading Material",
      "Crib",
      "Air Conditioning", "Heating",
      "Exterior Security Cameras", "Smoke Alarm",
      "Carbon Monoxide Alarm", "Fire Extinguisher", "First Aid Kit",
      "WiFi",
      "Kitchen", "Refrigerator", "Microwave", "Cooking Basics",
      "Dishes and Silverware", "Dishwasher", "Gas Stove",
      "Hot Water Kettle", "Coffee Maker", "Wine Glasses",
      "Toaster", "Baking Sheet", "Blender", "Barbecue Utensils",
      "Dining Table", "Coffee",
      "Free Parking on Premises", "Free Street Parking",
      "Pets Allowed", "Long Term Stays Allowed",
      "Self Check-In", "Keypad",
    ],
    reviews: [
      {
        guestName: "Erin",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment:
          "Needed a place to stay while our home was being painted. This home fit the bill. Enjoyed our stay — easy check in and check out. Coffee, paper towels, TP, plenty of towels, etc. were provided. Had a great stay!!",
        reviewDate: "2025-11-15",
      },
      {
        guestName: "Deepak",
        guestLocation: "Frisco, Texas",
        rating: 5,
        comment:
          "The Airbnb was very clean, host was extremely responsive and the home met all our expectations for the trip. Would recommend highly.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Pinkey",
        guestLocation: null,
        rating: 5,
        comment:
          "We really enjoyed our stay. The home was extremely clean and comfortable. The area was very quiet and peaceful. The host was very responsive when I contacted her. We will definitely stay at her home in the future.",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Bruna",
        guestLocation: "Katy, Texas",
        rating: 5,
        comment: "Great new house! We enjoyed our stay very much.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Dennis",
        guestLocation: "Burleson, Texas",
        rating: 5,
        comment:
          "Everything was as described. In a nice area, with fast and easy access to many shopping stores and restaurants.",
        reviewDate: "2025-04-15",
      },
      {
        guestName: "Ariel",
        guestLocation: "Fulshear, Texas",
        rating: 5,
        comment:
          "Great location and ease of access to surrounding amenities. Fits many people and great for our graduation company.",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Pharmeshia Jenell",
        guestLocation: null,
        rating: 5,
        comment:
          "I had an amazing stay! The place was exactly as described — clean, comfortable, and in a great location. The host was incredibly responsive and made sure everything was perfect. Check-in was smooth, and the little touches made it feel like home. I would definitely stay here again and highly recommend it!",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Alexssandra",
        guestLocation: null,
        rating: 5,
        comment:
          "The home was absolutely beautiful! The environment felt very private. House looks just like the photos provided. Host was responsive and willing to help if anything didn't go as planned, but we had no issues! We felt very at home and it worked great for our little weekend getaway!",
        reviewDate: "2024-10-15",
      },
      {
        guestName: "LaQuitta",
        guestLocation: null,
        rating: 5,
        comment:
          "Francisca was extremely helpful and communicative. My group ran into a hiccup upon arrival and she worked with us. The home was spacious, clean, nicely decorated, comfortable and it gave an at home feeling. We were minutes away from downtown and the area was peaceful. I'd definitely stay here again.",
        reviewDate: "2024-09-15",
      },
      {
        guestName: "Tiara",
        guestLocation: "Winston-Salem, North Carolina",
        rating: 5,
        comment:
          "Francisca's home was absolutely perfect! Each room was decorated nicely and clean. Each bedroom had its own bathroom attached which was a plus. The location was great — you could easily get to places in Houston in 20 minutes or less. The host was responsive. All in all absolutely wonderful stay. Highly recommend and I will definitely book again.",
        reviewDate: "2024-08-15",
      },
      {
        guestName: "Vinod",
        guestLocation: null,
        rating: 5,
        comment:
          "We had a very comfortable and relaxed stay. House is very clean. Comfortable beds. All amenities included and working. Location is great. Francisca was super responsive and friendly. Would gladly stay here again.",
        reviewDate: "2024-05-15",
      },
      {
        guestName: "Kimberley",
        guestLocation: null,
        rating: 5,
        comment:
          "Francesca was wonderful to work with! We ended up staying in two different townhomes and they were both beautiful, comfy, and immaculately clean!",
        reviewDate: "2024-05-15",
      },
      {
        guestName: "Stephanie",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment: "Very comfortable stay if you need to be near Fulshear.",
        reviewDate: "2025-08-15",
      },
      {
        guestName: "Rodney",
        guestLocation: "Houma, Louisiana",
        rating: 5,
        comment:
          "Great place. Very easy to find and close to downtown. Francisca is a great host and stayed communicating throughout the entire stay. 10/10 for the home and host. Would stay here again.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Tanya",
        guestLocation: "Charlotte, North Carolina",
        rating: 5,
        comment:
          "The place was super clean. The description was accurate. It was minutes away from all the hot spots. I will definitely consider this rental on my next visit.",
        reviewDate: "2024-07-15",
      },
      {
        guestName: "Janell",
        guestLocation: "Fayetteville, Arkansas",
        rating: 5,
        comment:
          "Francisca's house met all our expectations, it was clean, peaceful and had enough space for my family and me. She was also responsive and called when we were looking for items to point us in the right direction. I'd stay at Francisca's place again.",
        reviewDate: "2024-07-15",
      },
      {
        guestName: "Ahmad",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment: "Nice place and helpful host.",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Sergio",
        guestLocation: "Arlington, Virginia",
        rating: 5,
        comment:
          "Great place to stay, clean. Host was great, good communication, nice touch leaving some snacks and bottles of water upon arrival.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Alex",
        guestLocation: null,
        rating: 5,
        comment:
          "Amazing space for a group gathering! We had an amazing time here! It was nice, clean, and perfectly matched the photos and description.",
        reviewDate: "2025-02-15",
      },
      {
        guestName: "Leola Ln Properties",
        guestLocation: null,
        rating: 5,
        comment: "Great stay. Home was big and decorated cute.",
        reviewDate: "2025-01-15",
      },
      {
        guestName: "Seka",
        guestLocation: null,
        rating: 5,
        comment:
          "Amazing stay! Worth the price. Host was very responsive to messages and home was clean and provided the necessary amenities.",
        reviewDate: "2024-11-15",
      },
      {
        guestName: "Carissa",
        guestLocation: null,
        rating: 5,
        comment:
          "Francisca is a great host! The place is very clean and she is a super responsive host. We were happy with our stay.",
        reviewDate: "2024-09-15",
      },
      {
        guestName: "Edwin",
        guestLocation: "McKinney, Texas",
        rating: 5,
        comment:
          "This is a great property with everything you need. I booked a day after the hurricane and the host was extremely helpful.",
        reviewDate: "2024-07-15",
      },
      {
        guestName: "Deandra",
        guestLocation: null,
        rating: 5,
        comment:
          "Thank you so much for an unforgettable trip and stay. The location was perfect, excellent service. I had an easy and comfortable stay.",
        reviewDate: "2024-07-15",
      },
      {
        guestName: "Shardai",
        guestLocation: "Minneapolis, Minnesota",
        rating: 5,
        comment:
          "Beautiful home, nice and cozy! Very close to downtown if you enjoy going out. The host was very responsive and respectful! I will definitely book again.",
        reviewDate: "2024-06-15",
      },
      {
        guestName: "Javel",
        guestLocation: null,
        rating: 4,
        comment:
          "This place was a great deal for the price. Close to downtown Houston and all of the major highways. I would consider staying here again.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Madison",
        guestLocation: "Pinehurst, North Carolina",
        rating: 4,
        comment:
          "It was a great place to stay for going to/from the Convention Center. Good location.",
        reviewDate: "2025-02-15",
      },
      {
        guestName: "Teresa",
        guestLocation: "Houston, Texas",
        rating: 4,
        comment: "Overall a great stay. It is in a good location! Would definitely recommend.",
        reviewDate: "2024-09-15",
      },
      {
        guestName: "Marlen",
        guestLocation: "San Antonio, Texas",
        rating: 5,
        comment: "Great stay! And great communication from Francisca!",
        reviewDate: "2024-09-15",
      },
      {
        guestName: "Alantis",
        guestLocation: null,
        rating: 5,
        comment: "Lovely home. Francisca was very nice and responded quickly to any concerns I had.",
        reviewDate: "2024-08-15",
      },
      {
        guestName: "Christian",
        guestLocation: null,
        rating: 5,
        comment: "Excellent service and excellent place to stay.",
        reviewDate: "2024-09-15",
      },
      {
        guestName: "Kenyon",
        guestLocation: null,
        rating: 5,
        comment:
          "This Airbnb was everything for my birthday trip to Houston. The place was spotless and the neighborhood was very quiet and clean. The rooms are roomy with bathrooms and closet space. We were literally minutes away from all the nightlife, malls, and grocery stores. Our host Francisca was awesome as well. Overall stay 10 out of 10.",
        reviewDate: "2024-04-15",
      },
      {
        guestName: "Patricia",
        guestLocation: "Arteaga, Mexico",
        rating: 5,
        comment:
          "Great location. 5 min away from Minute Maid Park. House super clean and nice place to stay. Francisca super nice and helpful. We would definitely stay again.",
        reviewDate: "2024-04-15",
      },
      {
        guestName: "Glenda",
        guestLocation: null,
        rating: 5,
        comment: "Everything was great!",
        reviewDate: "2024-05-15",
      },
      {
        guestName: "Cormari",
        guestLocation: "Odessa, Texas",
        rating: 5,
        comment: "Best place for good price.",
        reviewDate: "2024-04-15",
      },
    ],
  },

  {
    name: "Rammies Home With Pool Access",
    guests: 8,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    description:
      "Make some memories at this unique and family-friendly place. Experience the perfect home away at this beautiful 3-bedroom, 2-bathroom vacation and short-term rental! Located near top attractions such as Typhoon Waterpark, Katy Mills and Main Event Center. This house is fully equipped with kitchen, covered patio where you can relax and enjoy with your family. This is the ideal house for your vacation.",
    amenities: [
      "Hair Dryer", "Cleaning Products", "Shampoo", "Conditioner",
      "Body Soap", "Hot Water", "Shower Gel",
      "Washer", "Dryer", "Essentials (Towels, bed sheets, soap, toilet paper)",
      "Hangers", "Bed Linens", "Extra Pillows and Blankets",
      "Room-Darkening Shades", "Iron", "Clothing Storage",
      "Ethernet Connection", "TV", "Books and Reading Material",
      "Crib", "Outlet Covers",
      "Air Conditioning", "Ceiling Fan", "Portable Fans", "Heating",
      "Exterior Security Cameras", "Smoke Alarm",
      "Carbon Monoxide Alarm", "Fire Extinguisher", "First Aid Kit",
      "WiFi", "Dedicated Workspace",
      "Kitchen", "Refrigerator", "Microwave", "Cooking Basics",
      "Dishes and Silverware", "Freezer", "Dishwasher",
      "Stove", "Oven", "Hot Water Kettle", "Coffee Maker",
      "Wine Glasses", "Toaster", "Blender", "Trash Compactor",
      "Dining Table", "Coffee",
      "Patio or Balcony", "Backyard", "Outdoor Furniture",
      "Outdoor Dining Area",
      "Free Parking on Premises", "Shared Pool (Seasonal)",
      "Single Level Home",
      "Pets Allowed", "Long Term Stays Allowed",
      "Self Check-In", "Smart Lock",
    ],
    reviews: [
      {
        guestName: "Diana",
        guestLocation: "Austin, Texas",
        rating: 5,
        comment:
          "We enjoyed our time at Francisca's place. She was extremely responsive and great about checking in and making sure we had what we needed. I especially appreciate being provided a garage clicker for ease of access as well as plenty of towels. Check in and check out instructions were straightforward and simple.",
        reviewDate: "2026-04-15",
      },
      {
        guestName: "Gwen",
        guestLocation: null,
        rating: 5,
        comment:
          "We had a great stay. We needed an earlier check in and Francisca was able to accommodate for a reasonable fee. She was responsive and checked to be sure we had everything we needed. Great host.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Jai",
        guestLocation: "Airdrie, Canada",
        rating: 5,
        comment:
          "Great small stay! The host is responsive and truly helped at every point. Very professionally kept place that feels like home.",
        reviewDate: "2025-12-15",
      },
      {
        guestName: "Zach",
        guestLocation: null,
        rating: 5,
        comment:
          "Excellent stay, felt right at home. Great playground within walking distance. Would recommend to friends.",
        reviewDate: "2025-12-15",
      },
      {
        guestName: "Joseph",
        guestLocation: null,
        rating: 5,
        comment: "Wonderful house and great host. Definitely recommend.",
        reviewDate: "2026-04-15",
      },
      {
        guestName: "Kavitha",
        guestLocation: null,
        rating: 5,
        comment: "Host is great and very responsive.",
        reviewDate: "2026-04-15",
      },
      {
        guestName: "Randy",
        guestLocation: "Dripping Springs, Texas",
        rating: 5,
        comment: "Great place. Great host. Needed to extend extra day and had no issues.",
        reviewDate: "2025-08-15",
      },
      {
        guestName: "Eli",
        guestLocation: "Orange Grove, Texas",
        rating: 5,
        comment:
          "Francisca's home was absolutely beautiful and felt right at home. Last minute we decided to extend our stay one more night just because the area and home was too nice for us to leave so soon. The Fulshear area is beyond beautiful and felt safe for my family. We will definitely be coming back.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Angela",
        guestLocation: "San Antonio, Texas",
        rating: 5,
        comment:
          "I absolutely loved staying here! The neighborhood was beautiful and peaceful! Francisca provided prompt responses and was always so nice. The place looked much better in person and was very clean. It had all the amenities that we needed. We felt safe and slept peacefully. It's only 30 mins from downtown Houston and an hour from Galveston.",
        reviewDate: "2024-08-15",
      },
      {
        guestName: "Brian",
        guestLocation: "Fairfield, Iowa",
        rating: 5,
        comment: "Great place and great host! Highly recommend.",
        reviewDate: "2025-10-15",
      },
      {
        guestName: "Billie",
        guestLocation: "Brookshire, Texas",
        rating: 5,
        comment:
          "The stay was very peaceful and just like being home. The beds are all extremely comfortable and home was very functional. Communication was almost instant which helped with questions. Would definitely stay again and fully recommend.",
        reviewDate: "2025-04-15",
      },
      {
        guestName: "Edwin",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment:
          "This house was great for my family of 4 and our two dogs. Francisca was very responsive and proactive with checking in. She made sure my family and I were okay. The house was exactly like the pictures, and the community was nice and quiet. I would highly recommend it.",
        reviewDate: "2024-12-15",
      },
      {
        guestName: "Jenna",
        guestLocation: "Chicago, Illinois",
        rating: 4,
        comment:
          "The home is clean and spacious and was great for our family and dogs while we were visiting extended family in the area. It feels like a large hotel suite with a yard.",
        reviewDate: "2024-08-15",
      },
      {
        guestName: "Jeff And Tina",
        guestLocation: "Champaign, Illinois",
        rating: 5,
        comment:
          "So thankful for Francisca's. She really helped us find a property while our house is being repaired. Great home for great price.",
        reviewDate: "2024-05-15",
      },
      {
        guestName: "Dk",
        guestLocation: null,
        rating: 4,
        comment: "Francisca was quick to respond. Overall the stay was good.",
        reviewDate: "2024-05-15",
      },
      {
        guestName: "Ugur",
        guestLocation: "Columbus, Ohio",
        rating: 5,
        comment:
          "It was one of the best stays we had on Airbnb. Peaceful and friendly neighborhood. House is actually way better than photos.",
        reviewDate: "2024-09-15",
      },
      {
        guestName: "Bailee",
        guestLocation: null,
        rating: 5,
        comment: "Great place to stay! Nice neighborhood and very dog friendly!",
        reviewDate: "2024-05-15",
      },
      {
        guestName: "Tracy",
        guestLocation: null,
        rating: 5,
        comment: "Everything was great and the hostess was very responsive with our needs.",
        reviewDate: "2024-07-15",
      },
      {
        guestName: "Jefferson",
        guestLocation: null,
        rating: 5,
        comment: "Great host!!",
        reviewDate: "2024-10-15",
      },
      {
        guestName: "John",
        guestLocation: "Columbia, Missouri",
        rating: 5,
        comment:
          "Responsive host. Clear instructions. Nice home — everything seemed brand new. Super clean.",
        reviewDate: "2024-04-15",
      },
      {
        guestName: "Jeanne",
        guestLocation: null,
        rating: 5,
        comment: "Everything was very clean and welcoming. Would definitely recommend staying there.",
        reviewDate: "2024-03-15",
      },
    ],
  },

  {
    name: "Rammies Exquisite Home With Pool Access",
    reviewsOnly: true,
    reviews: [
      {
        guestName: "Traci",
        guestLocation: "The Woodlands, Texas",
        rating: 5,
        comment:
          "The house was super clean and comfortable for all family members. We had three grandparents in their 80s with mobility issues. It was a perfect place to rest and relax. Very quiet and cool after big family wedding festivities. Bathrooms very clean. Nobody had to share. We highly recommend Francisca's place.",
        reviewDate: "2025-09-15",
      },
      {
        guestName: "Gabriela",
        guestLocation: "Miami, Florida",
        rating: 5,
        comment:
          "I never write reviews, but I have to say this time I really think it's worth it and deserved! Francisca's house was simply outstanding in every way, so clean and tidy, it had everything we needed and more, it smelled so good! Such a great experience, we loved our time spent there and would recommend it without a doubt!!",
        reviewDate: "2025-08-15",
      },
      {
        guestName: "Tamia",
        guestLocation: "Jackson, Tennessee",
        rating: 5,
        comment:
          "I had an amazing stay at Francisca's place! The apartment was exactly as described — clean, cozy, and thoughtfully decorated. The bed was incredibly comfortable, and the kitchen was well-equipped with everything I needed. Francisca was very responsive and provided great local recommendations. I would definitely stay here again!",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Mark",
        guestLocation: null,
        rating: 5,
        comment:
          "The home was very beautiful and was just as described. Instructions were very easy to understand and overall just an amazing host.",
        reviewDate: "2026-03-15",
      },
      {
        guestName: "Celeste",
        guestLocation: "Lake Wylie, South Carolina",
        rating: 5,
        comment:
          "This was our second stay at this Airbnb. The layout of the home is perfect with the master suite on the opposite side of the home from the other 3 bedrooms. Every bedroom is nicely decorated and very cozy, and each one has a TV. The neighborhood has a walking trail which we used every day. Francisca is a great host — always aiming to please and make sure you have everything you need!",
        reviewDate: "2025-10-15",
      },
      {
        guestName: "Lanre",
        guestLocation: "Texas, United States",
        rating: 5,
        comment:
          "We absolutely loved our stay! The home is modern, clean, and very comfortable — perfect for our family of 7 during our week-long stay. Everything we needed was provided, and it truly felt like a home away from home. Highly recommend!",
        reviewDate: "2025-08-15",
      },
      {
        guestName: "Ogogome",
        guestLocation: null,
        rating: 5,
        comment:
          "Excellent House — very neat and comfortable. My family and I had an amazing time, it was like home away from home. It was really nice to have access to the pool — my kids loved going there. Francisca was very welcoming, proactive and helpful. Would definitely recommend this house.",
        reviewDate: "2025-07-15",
      },
      {
        guestName: "Olalekan",
        guestLocation: "Maryland City, Maryland",
        rating: 5,
        comment:
          "This is by far one of the best Airbnbs I have used and the host was super amazing and very responsive. The house and rooms are really huge and super clean and the area is peaceful with a lot of fine restaurants to go to. I will definitely use this place again.",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Kirk",
        guestLocation: "Dallas, Texas",
        rating: 4,
        comment: "Great home and communication. Exactly what we needed for the long weekend.",
        reviewDate: "2026-04-15",
      },
      {
        guestName: "Henry",
        guestLocation: "Dublin, California",
        rating: 5,
        comment: "Host was amazing and the place was extremely clean. Really appreciate that!",
        reviewDate: "2025-11-15",
      },
      {
        guestName: "Cathy",
        guestLocation: "Fayetteville, Arkansas",
        rating: 5,
        comment: "The house was beautiful! Pictures don't do it justice! We will stay here again!",
        reviewDate: "2025-12-15",
      },
      {
        guestName: "Samir",
        guestLocation: null,
        rating: 5,
        comment:
          "Francisca's home was very nice and welcoming. Francisca was a great and attentive host!",
        reviewDate: "2025-10-15",
      },
      {
        guestName: "Sarah",
        guestLocation: "Edmonton, Canada",
        rating: 5,
        comment:
          "What stood out the most was the host's communication — she was absolutely fantastic! House was adequate for what we needed.",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Taiwo",
        guestLocation: null,
        rating: 5,
        comment: "It was a nice space that met my needs.",
        reviewDate: "2025-11-15",
      },
      {
        guestName: "Bryan",
        guestLocation: "Louisville, Kentucky",
        rating: 5,
        comment:
          "This is hands down the best Airbnb I've ever stayed in. It was absolutely beautiful — truly stunning — and spotless!",
        reviewDate: "2025-05-15",
      },
      {
        guestName: "Hugh",
        guestLocation: "San Francisco, California",
        rating: 5,
        comment:
          "Francisca runs one of the best, most professional Airbnbs I've ever been in.",
        reviewDate: "2025-06-15",
      },
      {
        guestName: "Sierra",
        guestLocation: "Port Charlotte, Florida",
        rating: 5,
        comment:
          "My family of 9 had a great time at this home. It was within walking distance of a nice park with a new playground and splash pad area for the kids to run their energy out. The house was more than enough space for all of us to fit comfortably. 12/10 stars highly recommend this home to anyone looking in the Katy area.",
        reviewDate: "2025-02-15",
      },
      {
        guestName: "Candice",
        guestLocation: "Kapolei, Hawaii",
        rating: 5,
        comment:
          "Exceptional home and location, better than described. All communications timely and professional. Immaculately clean, well stocked and comfortable home. New super soft, extra-large bath towels. New appliances throughout and fantastic living room furniture. Super quiet and safe neighborhood. A truly wonderful stay without a single glitch or issue. Would highly recommend this home and host.",
        reviewDate: "2024-10-15",
      },
      {
        guestName: "Marcia",
        guestLocation: null,
        rating: 5,
        comment:
          "My family enjoyed a very nice stay at this property. The house was appointed beautifully with current design, and all amenities we needed were made available. The host was available and responded within a few minutes. A++ property, we will definitely revisit.",
        reviewDate: "2024-10-15",
      },
      {
        guestName: "Younus",
        guestLocation: "Ballwin, Missouri",
        rating: 5,
        comment:
          "We had an excellent stay! The property was spotless and well-organized, making it easy to settle in and feel comfortable right away. The host's communication was top-notch, with quick responses and clear instructions. The neighborhood is incredibly safe and peaceful. I highly recommend this place and would definitely stay again!",
        reviewDate: "2024-09-15",
      },
      {
        guestName: "Sareya",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment: "We had a great stay. Thank you.",
        reviewDate: "2025-06-15",
      },
      {
        guestName: "Cynthia",
        guestLocation: null,
        rating: 5,
        comment:
          "Francisca was a very attentive host and her place was immaculate. The pictures were accurate and reflected the beauty of the place but the master bedroom with the ensuite was even more amazing. Her home is in a beautiful, quiet and safe neighborhood. This was by far the cleanest and best Airbnb I ever stayed in. The check in and check out process was so easy. If I could have given it more stars, I would have.",
        reviewDate: "2024-11-15",
      },
      {
        guestName: "Denise",
        guestLocation: "Mobile, Alabama",
        rating: 5,
        comment:
          "Went for a family party. This was the perfect place at the perfect location. The house was beautiful, very nice. Easy check in and out. Every night we went back to the house it felt like relaxing at home. If I needed a place at this location again I would definitely stay there again.",
        reviewDate: "2024-08-15",
      },
      {
        guestName: "Jasmine",
        guestLocation: "Odessa, Texas",
        rating: 5,
        comment:
          "The home was beautiful! Very clean! You felt right at home! Francisca was such an amazing host, very accommodating. We will definitely be staying here again in the future!",
        reviewDate: "2024-10-15",
      },
      {
        guestName: "Aishat",
        guestLocation: "Raleigh, North Carolina",
        rating: 5,
        comment:
          "Felt right at home! Immaculate home and great amenities! She was wonderful throughout our stay. She went out of her way to bring us a remote for one of the rooms and called to make sure we were enjoying our stay. She was so helpful and responsive. The neighborhood was quiet and the host took the time to write a welcome letter with important information. Would recommend this home for anyone coming from out of town.",
        reviewDate: "2024-07-15",
      },
      {
        guestName: "Celeste B",
        guestLocation: "Lake Wylie, South Carolina",
        rating: 5,
        comment:
          "This Airbnb is in a new and very nice community with a walking trail right down the street. The house is very clean, and the layout is perfect with the ensuite master bedroom being on the opposite side of the remaining 3 bedrooms. The beds were very comfortable with plenty of pillows. There are TVs in every bedroom and the living room! The space was just perfect for us, and we would definitely stay at any of Francisca's homes again!",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Donna",
        guestLocation: "Plano, Texas",
        rating: 5,
        comment:
          "Francisca's place is exactly as presented and she is a wonderful responsive host. The neighborhood is beautiful with many parks and great running/walking trails. The house is super clean and the beds very comfortable. The open kitchen/dining/family room was perfect for watching a movie. Francisca made things super easy for us to check-in and made our trip wonderful. Would definitely stay again.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Jodi",
        guestLocation: "New Braunfels, Texas",
        rating: 5,
        comment:
          "This was a great place to stay. It was clean and comfortable. It was very spacious so there was plenty of room for everyone.",
        reviewDate: "2025-02-15",
      },
      {
        guestName: "Anthony",
        guestLocation: "Houston, Texas",
        rating: 5,
        comment:
          "Very clean and new furniture made the house feel like home. Neighborhood is a quiet and safe area.",
        reviewDate: "2024-12-15",
      },
      {
        guestName: "Mary",
        guestLocation: "Katy, Texas",
        rating: 5,
        comment:
          "Great house in nice, quiet neighborhood. Francisca was easy to communicate with and helpful.",
        reviewDate: "2024-08-15",
      },
      {
        guestName: "Brittany",
        guestLocation: "Memphis, Tennessee",
        rating: 5,
        comment:
          "This home was very beautiful and clean! The neighborhood is very nice and quiet! I would definitely book this home again when I come back out to Houston.",
        reviewDate: "2024-06-15",
      },
      {
        guestName: "Karen",
        guestLocation: "Midland, Texas",
        rating: 5,
        comment:
          "It was exactly what we needed. The location was perfect. Personal touch. Good size, excellent upkeep and quiet.",
        reviewDate: "2024-05-15",
      },
      {
        guestName: "Marty",
        guestLocation: "Round Hill, Virginia",
        rating: 5,
        comment:
          "The home was great. It was clean and neat and our host was extremely friendly and responsive to our questions.",
        reviewDate: "2024-11-15",
      },
      {
        guestName: "Shelia",
        guestLocation: null,
        rating: 5,
        comment: "We had a wonderful stay. The property was clean, quiet and peaceful.",
        reviewDate: "2024-09-15",
      },
      {
        guestName: "Cindy",
        guestLocation: "Washington, District of Columbia",
        rating: 5,
        comment: "Super comfortable place, very responsive, clean and easy.",
        reviewDate: "2025-04-15",
      },
      {
        guestName: "Josh",
        guestLocation: "Aurora, Colorado",
        rating: 5,
        comment:
          "House was great and host was very flexible with our arrival and departure times.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Andres",
        guestLocation: "Glenn Heights, Texas",
        rating: 5,
        comment: "Thank you very much, very nice house and very clean.",
        reviewDate: "2024-10-15",
      },
      {
        guestName: "Alyssa",
        guestLocation: null,
        rating: 5,
        comment: "Beautiful home to stay at.",
        reviewDate: "2025-04-15",
      },
      {
        guestName: "Geng Bin",
        guestLocation: "Opelousas, Louisiana",
        rating: 5,
        comment: "Nice big clean house.",
        reviewDate: "2025-03-15",
      },
      {
        guestName: "Adrea",
        guestLocation: null,
        rating: 5,
        comment: "I would recommend.",
        reviewDate: "2025-02-15",
      },
      {
        guestName: "David",
        guestLocation: "Aubrey, Texas",
        rating: 5,
        comment: "Great place to stay.",
        reviewDate: "2024-08-15",
      },
      {
        guestName: "Manny",
        guestLocation: null,
        rating: 5,
        comment: "Great place to stay. Large clean house that made our work trip a breeze.",
        reviewDate: "2024-04-15",
      },
      {
        guestName: "Idessa",
        guestLocation: "Aurora, Illinois",
        rating: 5,
        comment:
          "Francisca's home was beautiful! Her hosting was great and she provided us with excellent service.",
        reviewDate: "2024-03-15",
      },
      {
        guestName: "Dorothy",
        guestLocation: "Laguna Niguel, California",
        rating: 5,
        comment:
          "Thank you Francisca, for sharing your home with us. Our trip to Houston was fabulous — so much to do and see.",
        reviewDate: "2024-03-15",
      },
    ],
  },
];

async function main() {
  const { prisma } = await import("../lib/prisma");

  let propertiesUpdated = 0;
  let reviewsInserted = 0;
  const errors: string[] = [];

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

      if (!prop.reviewsOnly) {
        await prisma.property.update({
          where: { id: property.id },
          data: {
            guests: prop.guests!,
            bedrooms: prop.bedrooms!,
            beds: prop.beds!,
            bathrooms: Math.round(prop.bathrooms!),
            description: prop.description!,
            amenities: prop.amenities!,
          },
        });
        console.log(`Updated: ${prop.name}`);
      }

      propertiesUpdated++;

      if (!prop.reviews || prop.reviews.length === 0) {
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
  console.log(`Properties updated: ${propertiesUpdated}/3`);
  console.log(`Reviews inserted: ${reviewsInserted} total`);
  console.log(`Errors: ${errors.length === 0 ? "None" : errors.join(", ")}`);

  await prisma.$disconnect().catch(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
