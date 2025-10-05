import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCategory, setSubCategory } from "../store/InterfaceSlice";
import { useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import { Categories, SubCategories } from "../../utlis/Info";
const PublicQueryOptions = () => {
  const dispatch = useAppDispatch();
  const { shwoOptions, category, subCategory } = useAppSelector(
    (state) => state.interface
  );
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  // const Categories = [
  //   { name: "AI" },
  //   { name: "Finance" },
  //   { name: "Technology" },
  //   { name: "Programming" },
  //   { name: "Science" },
  //   { name: "Mathematics" },
  //   { name: "Health & Medicine" },
  //   { name: "Business" },
  //   { name: "Arts & Design" },
  //   { name: "Humanities" },
  //   { name: "Social Sciences" },
  //   { name: "Education" },
  //   { name: "Engineering" },
  //   { name: "Law" },
  //   { name: "Entertainment" },
  //   { name: "Sports" },
  //   { name: "Other" },
  // ];
  // const SubCategories = [
  //   {
  //     parent: "AI",
  //     subcategories: [
  //       "Machine Learning",
  //       "Deep Learning",
  //       "Natural Language Processing",
  //       "Computer Vision",
  //       "Reinforcement Learning",
  //       "Robotics",
  //       "Expert Systems",
  //       "Speech Recognition",
  //       "AI Ethics",
  //       "Neural Networks",
  //       "Generative AI",
  //       "AI Safety",
  //       "Transfer Learning",
  //       "Federated Learning",
  //       "AutoML",
  //       "Computer Audition",
  //       "Affective Computing",
  //       "Swarm Intelligence",
  //     ],
  //   },
  //   {
  //     parent: "Finance",
  //     subcategories: [
  //       "Corporate Finance",
  //       "Investment Banking",
  //       "Personal Finance",
  //       "Financial Markets",
  //       "Risk Management",
  //       "Quantitative Finance",
  //       "Accounting",
  //       "Fintech",
  //       "Behavioral Finance",
  //       "International Finance",
  //       "Financial Modeling",
  //       "Portfolio Management",
  //       "Derivatives",
  //       "Cryptocurrency",
  //       "Financial Regulation",
  //       "Mergers & Acquisitions",
  //       "Wealth Management",
  //       "Insurance",
  //     ],
  //   },
  //   {
  //     parent: "Technology",
  //     subcategories: [
  //       "Web Development",
  //       "Mobile Development",
  //       "Cloud Computing",
  //       "Cybersecurity",
  //       "DevOps",
  //       "Data Science",
  //       "Blockchain",
  //       "IoT",
  //       "AR/VR",
  //       "Quantum Computing",
  //       "Embedded Systems",
  //       "Network Engineering",
  //       "Database Administration",
  //       "UI/UX Design",
  //       "Software Architecture",
  //       "IT Management",
  //       "System Administration",
  //     ],
  //   },
  //   {
  //     parent: "Programming",
  //     subcategories: [
  //       "Python",
  //       "JavaScript",
  //       "TypeScript",
  //       "Java",
  //       "C++",
  //       "C#",
  //       "Go",
  //       "Rust",
  //       "Ruby on Rails",
  //       "Swift",
  //       "Kotlin",
  //       "PHP",
  //       "SQL",
  //       "Shell Scripting",
  //       "R Programming",
  //       "Dart",
  //       "Scala",
  //       "Perl",
  //       "Haskell",
  //       "Assembly",
  //     ],
  //   },
  //   {
  //     parent: "Science",
  //     subcategories: [
  //       "Physics",
  //       "Chemistry",
  //       "Biology",
  //       "Astronomy",
  //       "Geology",
  //       "Environmental Science",
  //       "Materials Science",
  //       "Neuroscience",
  //       "Genetics",
  //       "Bioinformatics",
  //       "Pharmacology",
  //       "Ecology",
  //       "Paleontology",
  //       "Metallurgy",
  //       "Oceanography",
  //       "Atmospheric Science",
  //     ],
  //   },
  //   {
  //     parent: "Mathematics",
  //     subcategories: [
  //       "Algebra",
  //       "Calculus",
  //       "Geometry",
  //       "Statistics",
  //       "Number Theory",
  //       "Topology",
  //       "Discrete Mathematics",
  //       "Applied Mathematics",
  //       "Probability",
  //       "Linear Algebra",
  //       "Differential Equations",
  //       "Mathematical Logic",
  //       "Combinatorics",
  //       "Numerical Analysis",
  //       "Game Theory",
  //       "Complex Analysis",
  //     ],
  //   },
  //   {
  //     parent: "Health & Medicine",
  //     subcategories: [
  //       "Medicine",
  //       "Nursing",
  //       "Pharmacology",
  //       "Public Health",
  //       "Nutrition",
  //       "Dentistry",
  //       "Veterinary Medicine",
  //       "Medical Research",
  //       "Epidemiology",
  //       "Psychology",
  //       "Psychiatry",
  //       "Physical Therapy",
  //       "Sports Medicine",
  //       "Alternative Medicine",
  //       "Healthcare Administration",
  //     ],
  //   },
  //   {
  //     parent: "Business",
  //     subcategories: [
  //       "Entrepreneurship",
  //       "Marketing",
  //       "Management",
  //       "Sales",
  //       "Human Resources",
  //       "Operations",
  //       "Supply Chain",
  //       "E-commerce",
  //       "Business Strategy",
  //       "International Business",
  //       "Project Management",
  //       "Business Analytics",
  //       "Digital Marketing",
  //       "Brand Management",
  //       "Market Research",
  //     ],
  //   },
  //   {
  //     parent: "Arts & Design",
  //     subcategories: [
  //       "Graphic Design",
  //       "Fine Arts",
  //       "Digital Art",
  //       "Photography",
  //       "Animation",
  //       "Game Design",
  //       "Architecture",
  //       "Interior Design",
  //       "Industrial Design",
  //       "Fashion Design",
  //       "Illustration",
  //       "Typography",
  //       "User Experience Design",
  //       "Motion Graphics",
  //       "Sculpture",
  //       "Printmaking",
  //     ],
  //   },
  //   {
  //     parent: "Humanities",
  //     subcategories: [
  //       "History",
  //       "Philosophy",
  //       "Literature",
  //       "Linguistics",
  //       "Religious Studies",
  //       "Cultural Studies",
  //       "Archaeology",
  //       "Anthropology",
  //       "Classical Studies",
  //       "Museum Studies",
  //       "Art History",
  //       "Ethics",
  //       "Political Philosophy",
  //       "Comparative Literature",
  //       "Critical Theory",
  //     ],
  //   },
  //   {
  //     parent: "Social Sciences",
  //     subcategories: [
  //       "Psychology",
  //       "Sociology",
  //       "Political Science",
  //       "Economics",
  //       "Anthropology",
  //       "Geography",
  //       "International Relations",
  //       "Public Policy",
  //       "Urban Studies",
  //       "Demography",
  //       "Cognitive Science",
  //       "Social Work",
  //       "Criminology",
  //       "Gender Studies",
  //       "Development Studies",
  //     ],
  //   },
  //   {
  //     parent: "Education",
  //     subcategories: [
  //       "Teaching Methods",
  //       "Educational Technology",
  //       "Curriculum Development",
  //       "Special Education",
  //       "Early Childhood Education",
  //       "Higher Education",
  //       "Adult Education",
  //       "Educational Psychology",
  //       "Classroom Management",
  //       "Assessment & Evaluation",
  //       "Literacy Education",
  //       "STEM Education",
  //       "Language Teaching",
  //       "Educational Leadership",
  //     ],
  //   },
  //   {
  //     parent: "Engineering",
  //     subcategories: [
  //       "Mechanical Engineering",
  //       "Electrical Engineering",
  //       "Civil Engineering",
  //       "Chemical Engineering",
  //       "Computer Engineering",
  //       "Aerospace Engineering",
  //       "Biomedical Engineering",
  //       "Environmental Engineering",
  //       "Industrial Engineering",
  //       "Materials Engineering",
  //       "Nuclear Engineering",
  //       "Petroleum Engineering",
  //       "Structural Engineering",
  //       "Robotics Engineering",
  //     ],
  //   },
  //   {
  //     parent: "Law",
  //     subcategories: [
  //       "Criminal Law",
  //       "Civil Law",
  //       "Corporate Law",
  //       "International Law",
  //       "Constitutional Law",
  //       "Intellectual Property",
  //       "Environmental Law",
  //       "Human Rights Law",
  //       "Tax Law",
  //       "Family Law",
  //       "Immigration Law",
  //       "Cyber Law",
  //       "Labor Law",
  //       "Real Estate Law",
  //     ],
  //   },
  //   {
  //     parent: "Entertainment",
  //     subcategories: [
  //       "Film & Television",
  //       "Music Production",
  //       "Game Development",
  //       "Theater & Performing Arts",
  //       "Creative Writing",
  //       "Film Making",
  //       "Audio Engineering",
  //       "Screenwriting",
  //       "Acting",
  //       "Directing",
  //       "Music Theory",
  //       "Sound Design",
  //       "Visual Effects",
  //       "Broadcasting",
  //     ],
  //   },
  //   {
  //     parent: "Sports",
  //     subcategories: [
  //       "Sports Science",
  //       "Athletic Training",
  //       "Sports Medicine",
  //       "Sports Management",
  //       "Coaching",
  //       "Sports Psychology",
  //       "Exercise Physiology",
  //       "Nutrition for Athletes",
  //       "Sports Analytics",
  //       "Physical Education",
  //       "Recreation Management",
  //       "Sports Marketing",
  //     ],
  //   },
  //   {
  //     parent: "Other",
  //     subcategories: [
  //       "Personal Development",
  //       "Career Planning",
  //       "Language Learning",
  //       "Hobbies & Crafts",
  //       "Travel & Tourism",
  //       "Food & Cooking",
  //       "Home Improvement",
  //       "Parenting",
  //       "Relationships",
  //       "Mindfulness",
  //       "Productivity",
  //       "Sustainability",
  //       "Volunteering",
  //     ],
  //   },
  // ];
  return (
    <>
      <div className="relative z-50">
        {/* Main Options Container */}
        <div
          className={`bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg p-3 absolute -bottom-30 left-8 min-w-[220px] ${
            shwoOptions
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-2 pointer-events-none"
          } transition-all duration-200 flex gap-3`}
        >
          {/* Categories Section */}
          <div className="flex-1">
            <div className="relative group">
              <div className="text-sm font-medium px-2 py-1 text-gray-700 dark:text-gray-300">
                Categories
              </div>
              <div className="mt-1 space-y-0.2 ">
                {Categories.map((cat, index) => (
                  <div
                    key={index}
                    className="relative group/item"
                    onMouseEnter={() => setHoveredCategory(cat.name)}
                  >
                    <div className="flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors">
                      <span className="flex items-center gap-2">
                        <input
                          onChange={(e) =>
                            dispatch(setCategory(e.target.value))
                          }
                          value={cat.name}
                          name="category"
                          type="radio"
                          checked={category === cat.name}
                          className="w-3 h-3"
                        />
                        {cat.name}
                      </span>
                      {SubCategories.some((sc) => sc.parent === cat.name) && (
                        <IoMdArrowDropright
                          size={14}
                          className="text-gray-400"
                        />
                      )}
                    </div>

                    {/* Subcategories appear on hover */}
                    {SubCategories.some((sc) => sc.parent === cat.name) &&
                      hoveredCategory === cat.name && (
                        <div className="absolute top-0 left-full ml-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[180px] p-2 z-50 max-h-[300px] overflow-y-auto">
                          <div className="text-xs font-medium px-2 py-1 text-gray-500 dark:text-gray-400">
                            Subcategories
                          </div>
                          {SubCategories.find(
                            (sc) => sc.parent === cat.name
                          )?.subcategories.map((sub, subIndex) => (
                            <div
                              key={subIndex}
                              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                              onClick={() => {
                                dispatch(setSubCategory(sub));
                                setHoveredCategory(null);
                              }}
                            >
                              <input
                                type="radio"
                                name="subcategory"
                                checked={subCategory === sub}
                                onChange={() => {}}
                                className="w-3 h-3"
                              />
                              {sub}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="w-px bg-gray-200 dark:bg-gray-700"></div>

          {/* Other Options (DropDown) */}
          {/* <div className="flex-1">
            <DropDown />
          </div> */}
        </div>
      </div>
    </>
  );
};
export default PublicQueryOptions;
