// Learner-facing assessment questions. This module deliberately contains NO
// correct answers. Grading is delegated to the mock assessment service, which
// represents the future NestJS endpoint. Replace that service with a real API
// call before production so answer keys never ship to the browser.
export interface LearnerAssessmentOption {
  key: string;
  text: string;
}

export interface LearnerAssessmentQuestion {
  id: string;
  number: number;
  prompt: string;
  options: LearnerAssessmentOption[];
}

export interface LearnerAssessment {
  chapterNumber: number;
  instructions: string;
  questions: LearnerAssessmentQuestion[];
}

export const ASSESSMENT_BANK: Record<number, LearnerAssessment> = {
  "1": {
    "chapterNumber": 1,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-1-1",
        "number": 1,
        "prompt": "According to Section 1.3, how many shared responsibilities must every employee contribute to?",
        "options": [
          {
            "key": "A",
            "text": "Seven"
          },
          {
            "key": "B",
            "text": "Five"
          },
          {
            "key": "C",
            "text": "Ten"
          }
        ]
      },
      {
        "id": "q-1-2",
        "number": 2,
        "prompt": "Which of these is one of the shared responsibilities listed in the handbook?",
        "options": [
          {
            "key": "A",
            "text": "Aggressive selling"
          },
          {
            "key": "B",
            "text": "Working alone"
          },
          {
            "key": "C",
            "text": "Confidentiality"
          }
        ]
      },
      {
        "id": "q-1-3",
        "number": 3,
        "prompt": "Who represents MA Ventures, according to the Important box in Chapter 1?",
        "options": [
          {
            "key": "A",
            "text": "Every employee"
          },
          {
            "key": "B",
            "text": "Only the sales team"
          },
          {
            "key": "C",
            "text": "Only the management"
          }
        ]
      },
      {
        "id": "q-1-4",
        "number": 4,
        "prompt": "The key message of Chapter 1 says our success depends on what?",
        "options": [
          {
            "key": "A",
            "text": "The efforts of top performers alone"
          },
          {
            "key": "B",
            "text": "The combined contribution of every employee"
          },
          {
            "key": "C",
            "text": "Decisions taken by management alone"
          }
        ]
      }
    ]
  },
  "2": {
    "chapterNumber": 2,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-2-1",
        "number": 1,
        "prompt": "How long is Session 2 (real estate fundamentals and terminology)?",
        "options": [
          {
            "key": "A",
            "text": "35 minutes"
          },
          {
            "key": "B",
            "text": "25 minutes"
          },
          {
            "key": "C",
            "text": "20 minutes"
          }
        ]
      },
      {
        "id": "q-2-2",
        "number": 2,
        "prompt": "Which two sessions are each 30 minutes long?",
        "options": [
          {
            "key": "A",
            "text": "Brokerage business and Company culture"
          },
          {
            "key": "B",
            "text": "HR essentials, privacy and compliance; and Practical activities, quiz and commitment"
          },
          {
            "key": "C",
            "text": "Welcome session and Teams, systems and role clarity"
          }
        ]
      },
      {
        "id": "q-2-3",
        "number": 3,
        "prompt": "How long is the tea / comfort break on the agenda?",
        "options": [
          {
            "key": "A",
            "text": "15 minutes"
          },
          {
            "key": "B",
            "text": "10 minutes"
          },
          {
            "key": "C",
            "text": "20 minutes"
          }
        ]
      },
      {
        "id": "q-2-4",
        "number": 4,
        "prompt": "According to Section 2.1, an effective induction programme reduces what?",
        "options": [
          {
            "key": "A",
            "text": "Customer enquiries"
          },
          {
            "key": "B",
            "text": "Working hours"
          },
          {
            "key": "C",
            "text": "Confusion"
          }
        ]
      }
    ]
  },
  "3": {
    "chapterNumber": 3,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-3-1",
        "number": 1,
        "prompt": "In the Chapter 3 example, what is the customer's budget for a 2BHK apartment in Bengaluru?",
        "options": [
          {
            "key": "A",
            "text": "₹75 lakh"
          },
          {
            "key": "B",
            "text": "₹90 lakh"
          },
          {
            "key": "C",
            "text": "₹85 lakh"
          }
        ]
      },
      {
        "id": "q-3-2",
        "number": 2,
        "prompt": "Under which category does the handbook place logistics parks?",
        "options": [
          {
            "key": "A",
            "text": "Industrial real estate"
          },
          {
            "key": "B",
            "text": "Commercial real estate"
          },
          {
            "key": "C",
            "text": "Land and plots"
          }
        ]
      },
      {
        "id": "q-3-3",
        "number": 3,
        "prompt": "Which of these is listed under Commercial Real Estate?",
        "options": [
          {
            "key": "A",
            "text": "Villas"
          },
          {
            "key": "B",
            "text": "Warehouses"
          },
          {
            "key": "C",
            "text": "Co-working spaces"
          }
        ]
      },
      {
        "id": "q-3-4",
        "number": 4,
        "prompt": "Before discussing a property, what does the Key takeaway say to understand?",
        "options": [
          {
            "key": "A",
            "text": "Its category, permitted use and relevant requirements"
          },
          {
            "key": "B",
            "text": "Only its price"
          },
          {
            "key": "C",
            "text": "Only its location"
          }
        ]
      },
      {
        "id": "q-3-5",
        "number": 5,
        "prompt": "Which of these is listed as an example under Land and Plots?",
        "options": [
          {
            "key": "A",
            "text": "Showrooms"
          },
          {
            "key": "B",
            "text": "Approved layouts"
          },
          {
            "key": "C",
            "text": "Row houses"
          }
        ]
      }
    ]
  },
  "4": {
    "chapterNumber": 4,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-4-1",
        "number": 1,
        "prompt": "In the primary market, who is usually the seller?",
        "options": [
          {
            "key": "A",
            "text": "The existing owner"
          },
          {
            "key": "B",
            "text": "The broker"
          },
          {
            "key": "C",
            "text": "The developer"
          }
        ]
      },
      {
        "id": "q-4-2",
        "number": 2,
        "prompt": "In the handbook, a family buying an apartment for ₹90 lakh is an example of which transaction?",
        "options": [
          {
            "key": "A",
            "text": "Purchase transaction"
          },
          {
            "key": "B",
            "text": "Resale transaction"
          },
          {
            "key": "C",
            "text": "Rental transaction"
          }
        ]
      },
      {
        "id": "q-4-3",
        "number": 3,
        "prompt": "A tenant occupying an apartment for ₹30,000 per month is which type of transaction?",
        "options": [
          {
            "key": "A",
            "text": "Commercial lease transaction"
          },
          {
            "key": "B",
            "text": "Rental transaction"
          },
          {
            "key": "C",
            "text": "Resale transaction"
          }
        ]
      },
      {
        "id": "q-4-4",
        "number": 4,
        "prompt": "A company taking an office under a five-year lease is which type of transaction?",
        "options": [
          {
            "key": "A",
            "text": "Rental transaction"
          },
          {
            "key": "B",
            "text": "Commercial lease transaction"
          },
          {
            "key": "C",
            "text": "Purchase transaction"
          }
        ]
      },
      {
        "id": "q-4-5",
        "number": 5,
        "prompt": "Which of these is listed as a common term of the primary market?",
        "options": [
          {
            "key": "A",
            "text": "Resale"
          },
          {
            "key": "B",
            "text": "Transfer of ownership"
          },
          {
            "key": "C",
            "text": "Allotment"
          }
        ]
      }
    ]
  },
  "5": {
    "chapterNumber": 5,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-5-1",
        "number": 1,
        "prompt": "Which of these is included in carpet area as explained in the handbook?",
        "options": [
          {
            "key": "A",
            "text": "Exclusive balcony"
          },
          {
            "key": "B",
            "text": "Internal partition walls"
          },
          {
            "key": "C",
            "text": "External walls"
          }
        ]
      },
      {
        "id": "q-5-2",
        "number": 2,
        "prompt": "The handbook's example has carpet area 1,000 sq. ft. and super built-up area 1,300 sq. ft. What is the loading?",
        "options": [
          {
            "key": "A",
            "text": "13%"
          },
          {
            "key": "B",
            "text": "30%"
          },
          {
            "key": "C",
            "text": "300%"
          }
        ]
      },
      {
        "id": "q-5-3",
        "number": 3,
        "prompt": "Property value ₹60 lakh and monthly rent ₹30,000: what gross rental yield does the handbook show?",
        "options": [
          {
            "key": "A",
            "text": "3.6%"
          },
          {
            "key": "B",
            "text": "12%"
          },
          {
            "key": "C",
            "text": "6%"
          }
        ]
      },
      {
        "id": "q-5-4",
        "number": 4,
        "prompt": "Plot area 2,000 sq. ft. and permissible FSI 2 gives an illustrative permissible floor area of what?",
        "options": [
          {
            "key": "A",
            "text": "4,000 sq. ft."
          },
          {
            "key": "B",
            "text": "2,000 sq. ft."
          },
          {
            "key": "C",
            "text": "1,000 sq. ft."
          }
        ]
      },
      {
        "id": "q-5-5",
        "number": 5,
        "prompt": "Super built-up area is sometimes called what?",
        "options": [
          {
            "key": "A",
            "text": "Net area"
          },
          {
            "key": "B",
            "text": "Plot area"
          },
          {
            "key": "C",
            "text": "Saleable area"
          }
        ]
      }
    ]
  },
  "6": {
    "chapterNumber": 6,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-6-1",
        "number": 1,
        "prompt": "In the handbook example, 1,000 sq. ft. at ₹8,000 per sq. ft. gives what base price?",
        "options": [
          {
            "key": "A",
            "text": "₹80,00,000"
          },
          {
            "key": "B",
            "text": "₹8,00,000"
          },
          {
            "key": "C",
            "text": "₹90,00,000"
          }
        ]
      },
      {
        "id": "q-6-2",
        "number": 2,
        "prompt": "In the illustrative cost table, how much is the PLC?",
        "options": [
          {
            "key": "A",
            "text": "₹3,00,000"
          },
          {
            "key": "B",
            "text": "₹1,00,000"
          },
          {
            "key": "C",
            "text": "₹2,00,000"
          }
        ]
      },
      {
        "id": "q-6-3",
        "number": 3,
        "prompt": "What is the illustrative subtotal in the cost table?",
        "options": [
          {
            "key": "A",
            "text": "₹86,00,000"
          },
          {
            "key": "B",
            "text": "₹85,00,000"
          },
          {
            "key": "C",
            "text": "₹80,00,000"
          }
        ]
      },
      {
        "id": "q-6-4",
        "number": 4,
        "prompt": "Which items does the handbook say may be additional to the illustrative subtotal?",
        "options": [
          {
            "key": "A",
            "text": "The base price"
          },
          {
            "key": "B",
            "text": "Stamp duty and registration charges"
          },
          {
            "key": "C",
            "text": "Parking charges"
          }
        ]
      },
      {
        "id": "q-6-5",
        "number": 5,
        "prompt": "Which of these is given as an example of preferential location charges?",
        "options": [
          {
            "key": "A",
            "text": "Maintenance deposit"
          },
          {
            "key": "B",
            "text": "Park-facing apartment"
          },
          {
            "key": "C",
            "text": "Documentation charges"
          }
        ]
      }
    ]
  },
  "7": {
    "chapterNumber": 7,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-7-1",
        "number": 1,
        "prompt": "According to the handbook, an Encumbrance Certificate is what?",
        "options": [
          {
            "key": "A",
            "text": "Not by itself a guarantee of clear title"
          },
          {
            "key": "B",
            "text": "Final proof of ownership"
          },
          {
            "key": "C",
            "text": "A building approval"
          }
        ]
      },
      {
        "id": "q-7-2",
        "number": 2,
        "prompt": "The Occupancy Certificate (OC) confirms what?",
        "options": [
          {
            "key": "A",
            "text": "Construction may now begin"
          },
          {
            "key": "B",
            "text": "The building meets applicable occupation requirements"
          },
          {
            "key": "C",
            "text": "The land use has been converted"
          }
        ]
      },
      {
        "id": "q-7-3",
        "number": 3,
        "prompt": "Which Karnataka record does the handbook say employees may encounter?",
        "options": [
          {
            "key": "A",
            "text": "Layout approval"
          },
          {
            "key": "B",
            "text": "e-Khata"
          },
          {
            "key": "C",
            "text": "Survey number"
          }
        ]
      },
      {
        "id": "q-7-4",
        "number": 4,
        "prompt": "A customer asks whether title is clear based only on a brochure. What does the handbook require?",
        "options": [
          {
            "key": "A",
            "text": "Confirm it from the brochure"
          },
          {
            "key": "B",
            "text": "Say yes if the EC shows no entries"
          },
          {
            "key": "C",
            "text": "Escalate to the authorised team"
          }
        ]
      },
      {
        "id": "q-7-5",
        "number": 5,
        "prompt": "What does the Commencement Certificate permit?",
        "options": [
          {
            "key": "A",
            "text": "Construction to commence, where applicable"
          },
          {
            "key": "B",
            "text": "Occupation of the building"
          },
          {
            "key": "C",
            "text": "Registration of the sale"
          }
        ]
      }
    ]
  },
  "8": {
    "chapterNumber": 8,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-8-1",
        "number": 1,
        "prompt": "In a non-exclusive mandate, what can the owner do?",
        "options": [
          {
            "key": "A",
            "text": "Engage only one broker"
          },
          {
            "key": "B",
            "text": "Engage multiple brokers"
          },
          {
            "key": "C",
            "text": "Sell only through a builder"
          }
        ]
      },
      {
        "id": "q-8-2",
        "number": 2,
        "prompt": "What does co-broking mean?",
        "options": [
          {
            "key": "A",
            "text": "A broker working alone"
          },
          {
            "key": "B",
            "text": "A builder selling directly"
          },
          {
            "key": "C",
            "text": "Two or more brokers collaborating on a transaction"
          }
        ]
      },
      {
        "id": "q-8-3",
        "number": 3,
        "prompt": "What does the handbook say a pipeline is?",
        "options": [
          {
            "key": "A",
            "text": "Business opportunities being worked on at different stages"
          },
          {
            "key": "B",
            "text": "Properties available for sale"
          },
          {
            "key": "C",
            "text": "A list of completed sales"
          }
        ]
      },
      {
        "id": "q-8-4",
        "number": 4,
        "prompt": "What is inventory?",
        "options": [
          {
            "key": "A",
            "text": "A potential customer enquiry"
          },
          {
            "key": "B",
            "text": "A fee for brokerage"
          },
          {
            "key": "C",
            "text": "Properties available for sale or lease"
          }
        ]
      },
      {
        "id": "q-8-5",
        "number": 5,
        "prompt": "What does the Key takeaway call brokerage?",
        "options": [
          {
            "key": "A",
            "text": "A service business"
          },
          {
            "key": "B",
            "text": "A manufacturing business"
          },
          {
            "key": "C",
            "text": "A lending business"
          }
        ]
      }
    ]
  },
  "9": {
    "chapterNumber": 9,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-9-1",
        "number": 1,
        "prompt": "How many stages does the handbook list in the transaction journey?",
        "options": [
          {
            "key": "A",
            "text": "8"
          },
          {
            "key": "B",
            "text": "10"
          },
          {
            "key": "C",
            "text": "11"
          }
        ]
      },
      {
        "id": "q-9-2",
        "number": 2,
        "prompt": "Which stage comes directly after Negotiation?",
        "options": [
          {
            "key": "A",
            "text": "Token / Expression of Interest"
          },
          {
            "key": "B",
            "text": "Due Diligence"
          },
          {
            "key": "C",
            "text": "Site Visit"
          }
        ]
      },
      {
        "id": "q-9-3",
        "number": 3,
        "prompt": "Which task is listed under preparing for a site visit?",
        "options": [
          {
            "key": "A",
            "text": "Collect brokerage"
          },
          {
            "key": "B",
            "text": "Check the latest availability"
          },
          {
            "key": "C",
            "text": "Sign the sale deed"
          }
        ]
      },
      {
        "id": "q-9-4",
        "number": 4,
        "prompt": "Does a customer paying a token mean the transaction is legally complete or brokerage is earned?",
        "options": [
          {
            "key": "A",
            "text": "Yes, always"
          },
          {
            "key": "B",
            "text": "No, follow the written agreement and company policy"
          },
          {
            "key": "C",
            "text": "Only if the customer visited the site"
          }
        ]
      },
      {
        "id": "q-9-5",
        "number": 5,
        "prompt": "What is the final stage of the journey?",
        "options": [
          {
            "key": "A",
            "text": "Registration and Handover"
          },
          {
            "key": "B",
            "text": "Negotiation"
          },
          {
            "key": "C",
            "text": "Brokerage Closure"
          }
        ]
      }
    ]
  },
  "10": {
    "chapterNumber": 10,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-10-1",
        "number": 1,
        "prompt": "In the handbook's sale example, a 1% brokerage on a ₹1 crore transaction equals what?",
        "options": [
          {
            "key": "A",
            "text": "₹10 lakh"
          },
          {
            "key": "B",
            "text": "₹1 lakh"
          },
          {
            "key": "C",
            "text": "₹10,000"
          }
        ]
      },
      {
        "id": "q-10-2",
        "number": 2,
        "prompt": "In the rental example with monthly rent ₹30,000 and brokerage of one month's rent, what is the brokerage?",
        "options": [
          {
            "key": "A",
            "text": "₹3,000"
          },
          {
            "key": "B",
            "text": "₹30,000"
          },
          {
            "key": "C",
            "text": "₹3,60,000"
          }
        ]
      },
      {
        "id": "q-10-3",
        "number": 3,
        "prompt": "What is a payout trigger?",
        "options": [
          {
            "key": "A",
            "text": "A fee for introducing a client"
          },
          {
            "key": "B",
            "text": "An amount due to the company"
          },
          {
            "key": "C",
            "text": "The event that makes commission payable under the agreement"
          }
        ]
      },
      {
        "id": "q-10-4",
        "number": 4,
        "prompt": "May an employee independently promise commission percentages?",
        "options": [
          {
            "key": "A",
            "text": "No, all commercial terms must follow approved company policy"
          },
          {
            "key": "B",
            "text": "Yes, if the customer asks"
          },
          {
            "key": "C",
            "text": "Yes, for regular customers"
          }
        ]
      },
      {
        "id": "q-10-5",
        "number": 5,
        "prompt": "What is a receivable?",
        "options": [
          {
            "key": "A",
            "text": "A fee paid to another broker"
          },
          {
            "key": "B",
            "text": "A document requesting payment"
          },
          {
            "key": "C",
            "text": "An amount due to the company"
          }
        ]
      }
    ]
  },
  "11": {
    "chapterNumber": 11,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-11-1",
        "number": 1,
        "prompt": "A customer asks if their loan will definitely be approved. What does the handbook suggest saying?",
        "options": [
          {
            "key": "A",
            "text": "It will definitely be approved"
          },
          {
            "key": "B",
            "text": "Do not worry about the loan"
          },
          {
            "key": "C",
            "text": "Loan approval depends on the lender's assessment and your eligibility"
          }
        ]
      },
      {
        "id": "q-11-2",
        "number": 2,
        "prompt": "What is the first step when handling a customer complaint?",
        "options": [
          {
            "key": "A",
            "text": "Listen without interrupting"
          },
          {
            "key": "B",
            "text": "Record the complaint"
          },
          {
            "key": "C",
            "text": "Inform the supervisor"
          }
        ]
      },
      {
        "id": "q-11-3",
        "number": 3,
        "prompt": "How many professional communication standards are listed in Section 11.2?",
        "options": [
          {
            "key": "A",
            "text": "7"
          },
          {
            "key": "B",
            "text": "5"
          },
          {
            "key": "C",
            "text": "10"
          }
        ]
      },
      {
        "id": "q-11-4",
        "number": 4,
        "prompt": "What does the Key takeaway say about complaints?",
        "options": [
          {
            "key": "A",
            "text": "Never ignore a complaint or make promises outside your authority"
          },
          {
            "key": "B",
            "text": "Always offer compensation"
          },
          {
            "key": "C",
            "text": "Pass it to the customer's lawyer"
          }
        ]
      },
      {
        "id": "q-11-5",
        "number": 5,
        "prompt": "Which is listed among the things customers expect?",
        "options": [
          {
            "key": "A",
            "text": "Guaranteed discounts"
          },
          {
            "key": "B",
            "text": "Timely responses"
          },
          {
            "key": "C",
            "text": "Free gifts"
          }
        ]
      }
    ]
  },
  "12": {
    "chapterNumber": 12,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-12-1",
        "number": 1,
        "prompt": "Which of these is given as an example of a conflict of interest?",
        "options": [
          {
            "key": "A",
            "text": "Promoting a property because of an undisclosed personal commission"
          },
          {
            "key": "B",
            "text": "Arriving early for work"
          },
          {
            "key": "C",
            "text": "Sharing a company holiday calendar"
          }
        ]
      },
      {
        "id": "q-12-2",
        "number": 2,
        "prompt": "To whom should employees disclose potential conflicts?",
        "options": [
          {
            "key": "A",
            "text": "Only the customer"
          },
          {
            "key": "B",
            "text": "Their reporting manager"
          },
          {
            "key": "C",
            "text": "No one"
          }
        ]
      },
      {
        "id": "q-12-3",
        "number": 3,
        "prompt": "Which of these must marketing materials not misrepresent?",
        "options": [
          {
            "key": "A",
            "text": "The employee's name"
          },
          {
            "key": "B",
            "text": "Possession dates"
          },
          {
            "key": "C",
            "text": "Office timings"
          }
        ]
      },
      {
        "id": "q-12-4",
        "number": 4,
        "prompt": "What should employees follow regarding gifts and hospitality?",
        "options": [
          {
            "key": "A",
            "text": "Their personal judgement"
          },
          {
            "key": "B",
            "text": "The customer's wishes"
          },
          {
            "key": "C",
            "text": "Company policy"
          }
        ]
      },
      {
        "id": "q-12-5",
        "number": 5,
        "prompt": "What does the Important box in Chapter 12 say never to do?",
        "options": [
          {
            "key": "A",
            "text": "Mislead a customer to achieve a sale"
          },
          {
            "key": "B",
            "text": "Reply to emails after lunch"
          },
          {
            "key": "C",
            "text": "Attend a site visit alone"
          }
        ]
      }
    ]
  },
  "13": {
    "chapterNumber": 13,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-13-1",
        "number": 1,
        "prompt": "Who should be informed about delays or absence?",
        "options": [
          {
            "key": "A",
            "text": "The customer"
          },
          {
            "key": "B",
            "text": "The reporting manager"
          },
          {
            "key": "C",
            "text": "A colleague from another team"
          }
        ]
      },
      {
        "id": "q-13-2",
        "number": 2,
        "prompt": "Who should communicate targets and assessment criteria?",
        "options": [
          {
            "key": "A",
            "text": "The customer"
          },
          {
            "key": "B",
            "text": "The trainer"
          },
          {
            "key": "C",
            "text": "The reporting manager"
          }
        ]
      },
      {
        "id": "q-13-3",
        "number": 3,
        "prompt": "With what must Chapter 13's rules be aligned?",
        "options": [
          {
            "key": "A",
            "text": "The approved MA Ventures HR policy and appointment terms"
          },
          {
            "key": "B",
            "text": "A colleague's advice"
          },
          {
            "key": "C",
            "text": "Industry gossip"
          }
        ]
      },
      {
        "id": "q-13-4",
        "number": 4,
        "prompt": "Which of these is listed as a serious matter for the designated company process?",
        "options": [
          {
            "key": "A",
            "text": "A change of seat"
          },
          {
            "key": "B",
            "text": "A printer fault"
          },
          {
            "key": "C",
            "text": "Harassment"
          }
        ]
      },
      {
        "id": "q-13-5",
        "number": 5,
        "prompt": "Which of these is a listed performance measure?",
        "options": [
          {
            "key": "A",
            "text": "Process compliance"
          },
          {
            "key": "B",
            "text": "Number of social media followers"
          },
          {
            "key": "C",
            "text": "Years of experience"
          }
        ]
      }
    ]
  },
  "14": {
    "chapterNumber": 14,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-14-1",
        "number": 1,
        "prompt": "How many data protection rules are listed in Section 14.2?",
        "options": [
          {
            "key": "A",
            "text": "7"
          },
          {
            "key": "B",
            "text": "10"
          },
          {
            "key": "C",
            "text": "5"
          }
        ]
      },
      {
        "id": "q-14-2",
        "number": 2,
        "prompt": "Where should customer documents not be stored?",
        "options": [
          {
            "key": "A",
            "text": "In approved company systems"
          },
          {
            "key": "B",
            "text": "In the company's records"
          },
          {
            "key": "C",
            "text": "On unauthorised personal devices"
          }
        ]
      },
      {
        "id": "q-14-3",
        "number": 3,
        "prompt": "What should you do if you suspect data loss or unauthorised access?",
        "options": [
          {
            "key": "A",
            "text": "Report it promptly"
          },
          {
            "key": "B",
            "text": "Wait to see if it repeats"
          },
          {
            "key": "C",
            "text": "Delete the evidence"
          }
        ]
      },
      {
        "id": "q-14-4",
        "number": 4,
        "prompt": "Which of these is listed as sensitive information?",
        "options": [
          {
            "key": "A",
            "text": "The weather report"
          },
          {
            "key": "B",
            "text": "Identity documents"
          },
          {
            "key": "C",
            "text": "The office address of a vendor"
          }
        ]
      },
      {
        "id": "q-14-5",
        "number": 5,
        "prompt": "In which year was the RERA Act passed, as named in the handbook?",
        "options": [
          {
            "key": "A",
            "text": "2013"
          },
          {
            "key": "B",
            "text": "2016"
          },
          {
            "key": "C",
            "text": "2019"
          }
        ]
      }
    ]
  },
  "15": {
    "chapterNumber": 15,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-15-1",
        "number": 1,
        "prompt": "Which department handles invoice management and receivables tracking?",
        "options": [
          {
            "key": "A",
            "text": "Marketing"
          },
          {
            "key": "B",
            "text": "Accounts and Finance"
          },
          {
            "key": "C",
            "text": "Telecalling"
          }
        ]
      },
      {
        "id": "q-15-2",
        "number": 2,
        "prompt": "Which task is listed under Telecalling and Lead Generation?",
        "options": [
          {
            "key": "A",
            "text": "Approving policy"
          },
          {
            "key": "B",
            "text": "Scheduling appointments"
          },
          {
            "key": "C",
            "text": "Managing receivables"
          }
        ]
      },
      {
        "id": "q-15-3",
        "number": 3,
        "prompt": "Which function includes policy approval?",
        "options": [
          {
            "key": "A",
            "text": "Marketing"
          },
          {
            "key": "B",
            "text": "Operations"
          },
          {
            "key": "C",
            "text": "Management"
          }
        ]
      },
      {
        "id": "q-15-4",
        "number": 4,
        "prompt": "Why does the handbook say no department works in isolation?",
        "options": [
          {
            "key": "A",
            "text": "A transaction usually involves several employees and departments"
          },
          {
            "key": "B",
            "text": "Departments work in different cities"
          },
          {
            "key": "C",
            "text": "Each employee handles one customer alone"
          }
        ]
      },
      {
        "id": "q-15-5",
        "number": 5,
        "prompt": "Which department handles attendance and leave administration?",
        "options": [
          {
            "key": "A",
            "text": "Accounts and Finance"
          },
          {
            "key": "B",
            "text": "Operations and Coordination"
          },
          {
            "key": "C",
            "text": "HR and Administration"
          }
        ]
      }
    ]
  },
  "16": {
    "chapterNumber": 16,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-16-1",
        "number": 1,
        "prompt": "In Activity 2, what is the quoted base price (1,300 sq. ft. at ₹7,000)?",
        "options": [
          {
            "key": "A",
            "text": "₹70,00,000"
          },
          {
            "key": "B",
            "text": "₹78,00,000"
          },
          {
            "key": "C",
            "text": "₹91,00,000"
          }
        ]
      },
      {
        "id": "q-16-2",
        "number": 2,
        "prompt": "In Activity 1, how is a logistics warehouse categorised?",
        "options": [
          {
            "key": "A",
            "text": "Industrial"
          },
          {
            "key": "B",
            "text": "Commercial"
          },
          {
            "key": "C",
            "text": "Residential"
          }
        ]
      },
      {
        "id": "q-16-3",
        "number": 3,
        "prompt": "In Activity 4, what appreciation did the employee wrongly promise?",
        "options": [
          {
            "key": "A",
            "text": "10% in one year"
          },
          {
            "key": "B",
            "text": "30% in two years"
          },
          {
            "key": "C",
            "text": "30% in one year"
          }
        ]
      },
      {
        "id": "q-16-4",
        "number": 4,
        "prompt": "In Activity 3, what does the customer prefer?",
        "options": [
          {
            "key": "A",
            "text": "A ready-to-move property near the workplace"
          },
          {
            "key": "B",
            "text": "An under-construction property"
          },
          {
            "key": "C",
            "text": "A pre-launch project"
          }
        ]
      },
      {
        "id": "q-16-5",
        "number": 5,
        "prompt": "In Activity 6, what is the gross rental yield for ₹50 lakh and monthly rent of ₹25,000?",
        "options": [
          {
            "key": "A",
            "text": "3%"
          },
          {
            "key": "B",
            "text": "6%"
          },
          {
            "key": "C",
            "text": "12%"
          }
        ]
      }
    ]
  },
  "17": {
    "chapterNumber": 17,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-17-1",
        "number": 1,
        "prompt": "What does RERA stand for?",
        "options": [
          {
            "key": "A",
            "text": "Real Estate Regulatory Authority"
          },
          {
            "key": "B",
            "text": "Registered Estate Revenue Association"
          },
          {
            "key": "C",
            "text": "Real Estate Rental Agency"
          }
        ]
      },
      {
        "id": "q-17-2",
        "number": 2,
        "prompt": "Which area is defined under the RERA Act for an apartment?",
        "options": [
          {
            "key": "A",
            "text": "Super built-up area"
          },
          {
            "key": "B",
            "text": "Carpet area"
          },
          {
            "key": "C",
            "text": "Saleable area"
          }
        ]
      },
      {
        "id": "q-17-3",
        "number": 3,
        "prompt": "A property purchased directly from a developer is generally part of which market?",
        "options": [
          {
            "key": "A",
            "text": "Secondary market"
          },
          {
            "key": "B",
            "text": "Primary market"
          },
          {
            "key": "C",
            "text": "Rental market"
          }
        ]
      },
      {
        "id": "q-17-4",
        "number": 4,
        "prompt": "What does PLC stand for?",
        "options": [
          {
            "key": "A",
            "text": "Preferential Location Charges"
          },
          {
            "key": "B",
            "text": "Property Legal Certificate"
          },
          {
            "key": "C",
            "text": "Project Listing Commission"
          }
        ]
      },
      {
        "id": "q-17-5",
        "number": 5,
        "prompt": "What does EC stand for in property documentation?",
        "options": [
          {
            "key": "A",
            "text": "Execution Certificate"
          },
          {
            "key": "B",
            "text": "Encumbrance Certificate"
          },
          {
            "key": "C",
            "text": "Estate Confirmation"
          }
        ]
      },
      {
        "id": "q-17-6",
        "number": 6,
        "prompt": "What is UDS?",
        "options": [
          {
            "key": "A",
            "text": "Undivided Share of Land"
          },
          {
            "key": "B",
            "text": "Urban Development Scheme"
          },
          {
            "key": "C",
            "text": "Unit Development Size"
          }
        ]
      },
      {
        "id": "q-17-7",
        "number": 7,
        "prompt": "What is a lead?",
        "options": [
          {
            "key": "A",
            "text": "A completed sale"
          },
          {
            "key": "B",
            "text": "A potential customer enquiry"
          },
          {
            "key": "C",
            "text": "A registered property"
          }
        ]
      },
      {
        "id": "q-17-8",
        "number": 8,
        "prompt": "What does co-broking mean?",
        "options": [
          {
            "key": "A",
            "text": "A broker working alone"
          },
          {
            "key": "B",
            "text": "Two or more brokers collaborating"
          },
          {
            "key": "C",
            "text": "A builder selling directly"
          }
        ]
      },
      {
        "id": "q-17-9",
        "number": 9,
        "prompt": "What should an employee do when asked whether a property's title is legally clear?",
        "options": [
          {
            "key": "A",
            "text": "Guarantee it immediately"
          },
          {
            "key": "B",
            "text": "Guess based on the brochure"
          },
          {
            "key": "C",
            "text": "Refer it for proper legal and document verification"
          }
        ]
      },
      {
        "id": "q-17-10",
        "number": 10,
        "prompt": "Where should a customer token payment be received?",
        "options": [
          {
            "key": "A",
            "text": "An employee's personal account"
          },
          {
            "key": "B",
            "text": "A colleague's account"
          },
          {
            "key": "C",
            "text": "Only through approved company channels"
          }
        ]
      }
    ]
  },
  "18": {
    "chapterNumber": 18,
    "instructions": "Choose the best answer for each question. You can retake the assessment if needed.",
    "questions": [
      {
        "id": "q-18-1",
        "number": 1,
        "prompt": "How many commitments are listed in Section 18.2?",
        "options": [
          {
            "key": "A",
            "text": "7"
          },
          {
            "key": "B",
            "text": "10"
          },
          {
            "key": "C",
            "text": "12"
          }
        ]
      },
      {
        "id": "q-18-2",
        "number": 2,
        "prompt": "Which of these is one of the commitments?",
        "options": [
          {
            "key": "A",
            "text": "Selling at any cost"
          },
          {
            "key": "B",
            "text": "Working only on assigned targets"
          },
          {
            "key": "C",
            "text": "Avoiding misleading commitments"
          }
        ]
      },
      {
        "id": "q-18-3",
        "number": 3,
        "prompt": "Who signs the acknowledgement alongside the employee?",
        "options": [
          {
            "key": "A",
            "text": "Trainer / HR Representative"
          },
          {
            "key": "B",
            "text": "The customer"
          },
          {
            "key": "C",
            "text": "A property owner"
          }
        ]
      }
    ]
  },
  "21": {
    "chapterNumber": 21,
    "instructions": "Answer all 20 questions. You need 80% to pass the final assessment.",
    "questions": [
      {
        "id": "q-21-1",
        "number": 1,
        "prompt": "Clock Watchers: Session 2 (35 minutes) plus Session 3 (25 minutes) gives how many minutes?",
        "options": [
          {
            "key": "A",
            "text": "55"
          },
          {
            "key": "B",
            "text": "60"
          },
          {
            "key": "C",
            "text": "65"
          },
          {
            "key": "D",
            "text": "70"
          }
        ]
      },
      {
        "id": "q-21-2",
        "number": 2,
        "prompt": "Price Detective: A flat has 1,300 sq. ft. super built-up area, priced at ₹7,000 per sq. ft. on that area. What is the base price?",
        "options": [
          {
            "key": "A",
            "text": "₹70,00,000"
          },
          {
            "key": "B",
            "text": "₹78,00,000"
          },
          {
            "key": "C",
            "text": "₹1,04,00,000"
          },
          {
            "key": "D",
            "text": "₹91,00,000"
          }
        ]
      },
      {
        "id": "q-21-3",
        "number": 3,
        "prompt": "Loading Lab: Carpet area is 1,000 sq. ft. and super built-up area is 1,300 sq. ft. What is the loading?",
        "options": [
          {
            "key": "A",
            "text": "30%"
          },
          {
            "key": "B",
            "text": "13%"
          },
          {
            "key": "C",
            "text": "23%"
          },
          {
            "key": "D",
            "text": "300%"
          }
        ]
      },
      {
        "id": "q-21-4",
        "number": 4,
        "prompt": "Yield Quest: A ₹60 lakh property earns ₹30,000 a month. What is the gross rental yield?",
        "options": [
          {
            "key": "A",
            "text": "3.6%"
          },
          {
            "key": "B",
            "text": "12%"
          },
          {
            "key": "C",
            "text": "6%"
          },
          {
            "key": "D",
            "text": "30%"
          }
        ]
      },
      {
        "id": "q-21-5",
        "number": 5,
        "prompt": "FSI Builder: A 2,000 sq. ft. plot has an FSI of 2. What is the illustrative permissible floor area?",
        "options": [
          {
            "key": "A",
            "text": "2,000 sq. ft."
          },
          {
            "key": "B",
            "text": "1,000 sq. ft."
          },
          {
            "key": "C",
            "text": "4,000 sq. ft."
          },
          {
            "key": "D",
            "text": "6,000 sq. ft."
          }
        ]
      },
      {
        "id": "q-21-6",
        "number": 6,
        "prompt": "Budget Buster: A customer has ₹85 lakh. The illustrative subtotal of the handbook's cost table is ₹86,00,000. By how much is it above budget before stamp duty and registration?",
        "options": [
          {
            "key": "A",
            "text": "₹1,00,000"
          },
          {
            "key": "B",
            "text": "₹6,00,000"
          },
          {
            "key": "C",
            "text": "₹5,00,000"
          },
          {
            "key": "D",
            "text": "It is within budget"
          }
        ]
      },
      {
        "id": "q-21-7",
        "number": 7,
        "prompt": "Commission Combo: One company closes the sale example (1% on ₹1 crore) and the rental example (one month's rent of ₹30,000). What is the total illustrative brokerage?",
        "options": [
          {
            "key": "A",
            "text": "₹1,03,000"
          },
          {
            "key": "B",
            "text": "₹1,00,000"
          },
          {
            "key": "C",
            "text": "₹1,30,00,000"
          },
          {
            "key": "D",
            "text": "₹1,30,000"
          }
        ]
      },
      {
        "id": "q-21-8",
        "number": 8,
        "prompt": "Journey Map: Which stage sits between Site Visit and Token / Expression of Interest?",
        "options": [
          {
            "key": "A",
            "text": "Due Diligence"
          },
          {
            "key": "B",
            "text": "Negotiation"
          },
          {
            "key": "C",
            "text": "Property Matching"
          },
          {
            "key": "D",
            "text": "Registration and Handover"
          }
        ]
      },
      {
        "id": "q-21-9",
        "number": 9,
        "prompt": "Truth Teller: Which statement would the handbook approve?",
        "options": [
          {
            "key": "A",
            "text": "\"This will definitely double in two years.\""
          },
          {
            "key": "B",
            "text": "\"Future appreciation cannot be guaranteed.\""
          },
          {
            "key": "C",
            "text": "\"Your loan will definitely be approved.\""
          },
          {
            "key": "D",
            "text": "\"No need to verify the documents.\""
          }
        ]
      },
      {
        "id": "q-21-10",
        "number": 10,
        "prompt": "Paper Trail: Marcus says \"The EC shows nothing, so the title is 100% clear.\" What does the handbook say?",
        "options": [
          {
            "key": "A",
            "text": "He is right, an EC is enough"
          },
          {
            "key": "B",
            "text": "An EC replaces due diligence"
          },
          {
            "key": "C",
            "text": "Only a Khata is needed"
          },
          {
            "key": "D",
            "text": "An EC alone does not guarantee clear title"
          }
        ]
      },
      {
        "id": "q-21-11",
        "number": 11,
        "prompt": "Pre-launch Alert: Before engaging in pre-launch activity, what must employees verify?",
        "options": [
          {
            "key": "A",
            "text": "That it is legally permitted and RERA requirements are fulfilled"
          },
          {
            "key": "B",
            "text": "That the price is lowest in town"
          },
          {
            "key": "C",
            "text": "That the customer has a loan"
          },
          {
            "key": "D",
            "text": "That a site visit is booked"
          }
        ]
      },
      {
        "id": "q-21-12",
        "number": 12,
        "prompt": "Market Match: A builder launches a new project and a customer books directly through the developer. Which market is this?",
        "options": [
          {
            "key": "A",
            "text": "Secondary market"
          },
          {
            "key": "B",
            "text": "Rental market"
          },
          {
            "key": "C",
            "text": "Primary market"
          },
          {
            "key": "D",
            "text": "Co-broking market"
          }
        ]
      },
      {
        "id": "q-21-13",
        "number": 13,
        "prompt": "Mandate Mystery: Mr. Rao lets three different brokers market his flat. What type of mandate is this?",
        "options": [
          {
            "key": "A",
            "text": "Exclusive mandate"
          },
          {
            "key": "B",
            "text": "Referral mandate"
          },
          {
            "key": "C",
            "text": "Non-exclusive mandate"
          },
          {
            "key": "D",
            "text": "Co-brokerage mandate"
          }
        ]
      },
      {
        "id": "q-21-14",
        "number": 14,
        "prompt": "Team Up: Two brokers collaborate on one transaction. What is this called?",
        "options": [
          {
            "key": "A",
            "text": "Co-broking"
          },
          {
            "key": "B",
            "text": "Conversion"
          },
          {
            "key": "C",
            "text": "Pipeline"
          },
          {
            "key": "D",
            "text": "Listing"
          }
        ]
      },
      {
        "id": "q-21-15",
        "number": 15,
        "prompt": "Ethics Alert: An employee promises \"30% appreciation in one year\" with no reliable basis. What is wrong?",
        "options": [
          {
            "key": "A",
            "text": "It is too low a number"
          },
          {
            "key": "B",
            "text": "It should be said only in writing"
          },
          {
            "key": "C",
            "text": "Nothing is wrong"
          },
          {
            "key": "D",
            "text": "It is an unsupported guarantee"
          }
        ]
      },
      {
        "id": "q-21-16",
        "number": 16,
        "prompt": "Token Test: Where should a customer's token payment be received?",
        "options": [
          {
            "key": "A",
            "text": "In an employee's personal account"
          },
          {
            "key": "B",
            "text": "Only through approved company channels"
          },
          {
            "key": "C",
            "text": "In a colleague's account"
          },
          {
            "key": "D",
            "text": "In cash at the site"
          }
        ]
      },
      {
        "id": "q-21-17",
        "number": 17,
        "prompt": "Data Guard: How many data protection rules does Section 14.2 list?",
        "options": [
          {
            "key": "A",
            "text": "5"
          },
          {
            "key": "B",
            "text": "7"
          },
          {
            "key": "C",
            "text": "10"
          },
          {
            "key": "D",
            "text": "11"
          }
        ]
      },
      {
        "id": "q-21-18",
        "number": 18,
        "prompt": "Money Matters: Which team supports approved commission and payout processes?",
        "options": [
          {
            "key": "A",
            "text": "Marketing"
          },
          {
            "key": "B",
            "text": "Telecalling"
          },
          {
            "key": "C",
            "text": "Operations only"
          },
          {
            "key": "D",
            "text": "Accounts and Finance"
          }
        ]
      },
      {
        "id": "q-21-19",
        "number": 19,
        "prompt": "Number Crunch: Add the number of transaction journey stages and the number of employee commitments in Section 18.2. What is the total?",
        "options": [
          {
            "key": "A",
            "text": "21"
          },
          {
            "key": "B",
            "text": "19"
          },
          {
            "key": "C",
            "text": "23"
          },
          {
            "key": "D",
            "text": "17"
          }
        ]
      },
      {
        "id": "q-21-20",
        "number": 20,
        "prompt": "Grand Finale: Which line is MA Ventures' closing tagline?",
        "options": [
          {
            "key": "A",
            "text": "One Team. One Goal. One Success."
          },
          {
            "key": "B",
            "text": "Many Teams. One Standard. Always Winning."
          },
          {
            "key": "C",
            "text": "One Team. One Standard. One Commitment to Excellence."
          },
          {
            "key": "D",
            "text": "One Company. One Dream. One Sale."
          }
        ]
      }
    ]
  }
};

export function getLearnerAssessment(chapterNumber: number): LearnerAssessment | null {
  return ASSESSMENT_BANK[chapterNumber] ?? null;
}
