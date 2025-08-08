import React, { useState, FormEvent, ChangeEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  timestamp?: string;
  conceptClarity: string;
  questionsAddressed: string;
  confidenceFactors: string[];
  wellInformed: string;
  firstSevenDays: string;
  toolsUseful: string;
  supportiveAreas: string[];
  confidenceBuilding: string;
  brandRepresentation: string;
  futureVision: string;
  positiveStandout: string;
  improvementSuggestion: string;
  overallExperience: number;
}

const FeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    conceptClarity: '',
    questionsAddressed: '',
    confidenceFactors: [],
    wellInformed: '',
    firstSevenDays: '',
    toolsUseful: '',
    supportiveAreas: [],
    confidenceBuilding: '',
    brandRepresentation: '',
    futureVision: '',
    positiveStandout: '',
    improvementSuggestion: '',
    overallExperience: 0,
    timestamp: new Date().toISOString()
  });
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const currentValue = formData[name as keyof FormData] as string[];
      const updatedFactors = checked
        ? [...currentValue, value]
        : currentValue.filter((item) => item !== value);
      setFormData({ ...formData, [name]: updatedFactors });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const response = await fetch('https://sheetdb.io/api/v1/5o849tj26pu7k', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { ...formData, timestamp },
      }),
    });
    if (response.ok) {
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setFormData({
      name: '',
      email: '',
      conceptClarity: '',
      questionsAddressed: '',
      confidenceFactors: [],
      wellInformed: '',
      firstSevenDays: '',
      toolsUseful: '',
      supportiveAreas: [],
      confidenceBuilding: '',
      brandRepresentation: '',
      futureVision: '',
      positiveStandout: '',
      improvementSuggestion: '',
      overallExperience: 0,
      timestamp: new Date().toISOString(),
    });
    setCurrentSection(1);
  };

  const nextSection = () => {
    if (currentSection < 5) setCurrentSection(currentSection + 1);
  };

  const prevSection = () => {
    if (currentSection > 1) setCurrentSection(currentSection - 1);
  };

  const isSectionValid = (): boolean => {
    if (currentSection === 1) {
      return !!formData.name && !!formData.email;
    }
    if (currentSection === 2) {
      return !!formData.conceptClarity && !!formData.questionsAddressed && !!formData.wellInformed;
    }
    if (currentSection === 3) {
      return !!formData.firstSevenDays && !!formData.toolsUseful;
    }
    if (currentSection === 4) {
      return !!formData.confidenceBuilding && !!formData.brandRepresentation && !!formData.futureVision;
    }
    if (currentSection === 5) {
      return !!formData.positiveStandout && !!formData.improvementSuggestion && !!formData.overallExperience;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-100 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mb-4 sm:mb-6 flex justify-center">
        <img
          src="https://res.cloudinary.com/dxjna0dxi/image/upload/v1754627938/Untitled_design_2_cbvzaw.png"
          alt="EarlyJobs Logo"
          className="h-20 sm:h-24 md:h-32 transition-transform duration-500 ease-in-out hover:scale-110"
        />
      </div>

      <div className="w-full max-w-5xl bg-white p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl border border-orange-100">
        <h1 className="text-2xl sm:text-lg md:text-xl font-semibold text-center text-orange-600 mb-4 sm:mb-6 md:mb-8 tracking-tight">
          EarlyJobs Franchise Feedback
        </h1>
        <p className="text-center text-gray-600 mb-4 sm:mb-6 md:mb-8 font-medium text-sm sm:text-base max-w-2xl mx-auto">
          Your feedback is invaluable to us! By sharing your insights, you play a vital role in shaping the future of EarlyJobs. Your thoughts help us refine our processes, enhance support, and create a more empowering experience for all franchise partners.
        </p>

        <div className="flex flex-wrap justify-center mb-4 sm:mb-6 gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5].map((section) => (
            <button
              key={section}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ease-in-out ${
                currentSection === section
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600'
              }`}
              onClick={() => setCurrentSection(section)}
              disabled={section > 1 && (!formData.name || !formData.email)}
            >
              Section {section}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {currentSection === 1 && (
            <div className="p-4 sm:p-6 bg-orange-50 border border-orange-200 rounded-xl shadow-sm transition-all duration-300">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-orange-600 mb-4 tracking-tight">
                Section 1: Personal Information
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="p-4 sm:p-6 bg-orange-50 border border-orange-200 rounded-xl shadow-sm transition-all duration-300">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-orange-600 mb-4 tracking-tight">
                Section 2: Discovery & Decision Experience
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    How clear and inspiring did you find the concept of the opportunity?
                  </label>
                  {['1 – Not clear', '2 – Somewhat clear', '3 – Neutral', '4 – Clear', '5 – Very Clear and Motivating'].map(
                    (option) => (
                      <label key={option} className="block mt-2 group">
                        <input
                          type="radio"
                          name="conceptClarity"
                          value={option}
                          onChange={handleChange}
                          required
                          className="mr-2 text-orange-500 focus:ring-orange-500 h-4 sm:h-5"
                        />
                        <span className="text-gray-700 group-hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base">
                          {option}
                        </span>
                      </label>
                    )
                  )}
                </div>
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    How well were your questions and doubts addressed during early discussions?
                  </label>
                  {['1 – Poorly', '2 – Okay', '3 – Neutral', '4 – Well', '5 – Extremely Well'].map((option) => (
                    <label key={option} className="block mt-2 group">
                      <input
                        type="radio"
                        name="questionsAddressed"
                        value={option}
                        onChange={handleChange}
                        required
                        className="mr-2 text-orange-500 focus:ring-orange-500 h-4 sm:h-5"
                      />
                      <span className="text-gray-700 group-hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    What made you confident to move forward? (Select all that apply)
                  </label>
                  {[
                    'The structure & simplicity of the model',
                    'Belief in the long-term vision',
                    'Stories of existing partners',
                    'The platform\'s potential',
                    'Personal alignment with the mission',
                  ].map((option) => (
                    <label key={option} className="block mt-2 group">
                      <input
                        type="checkbox"
                        name="confidenceFactors"
                        value={option}
                        onChange={handleChange}
                        className="mr-2 text-orange-500 focus:ring-orange-500 h-4 sm:h-5"
                      />
                      <span className="text-gray-700 group-hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    Did you feel well-informed before deciding?
                  </label>
                  {['Yes', 'Mostly', 'Needed more clarity'].map((option) => (
                    <label key={option} className="block mt-2 group">
                      <input
                        type="radio"
                        name="wellInformed"
                        value={option}
                        onChange={handleChange}
                        required
                        className="mr-2 text-orange-500 focus:ring-orange-500 h-4 sm:h-5"
                      />
                      <span className="text-gray-700 group-hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="p-4 sm:p-6 bg-orange-50 border border-orange-200 rounded-xl shadow-sm transition-all duration-300">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-orange-600 mb-4 tracking-tight">
                Section 3: Getting Started & Setup Experience
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    How would you describe your first 7 days after joining?
                  </label>
                  {[
                    '1 – Confusing',
                    '2 – Slightly overwhelming',
                    '3 – Manageable',
                    '4 – Well-supported',
                    '5 – Seamless & Confident',
                  ].map((option) => (
                    <label key={option} className="block mt-2 group">
                      <input
                        type="radio"
                        name="firstSevenDays"
                        value={option}
                        onChange={handleChange}
                        required
                        className="mr-2 text-orange-500 focus:ring-orange-500 h-4 sm:h-5"
                      />
                      <span className="text-gray-700 group-hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    Were the tools and guidance useful and easy to follow?
                  </label>
                  {['1 – Not really', '2 – Somewhat', '3 – Neutral', '4 – Yes', '5 – Very useful'].map((option) => (
                    <label key={option} className="block mt-2 group">
                      <input
                        type="radio"
                        name="toolsUseful"
                        value={option}
                        onChange={handleChange}
                        required
                        className="mr-2 text-orange-500 focus:ring-orange-500 h-4 sm:h-5"
                      />
                      <span className="text-gray-700 group-hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    What areas were most supportive during setup? (Select all that apply)
                  </label>
                  {[
                    'Communication & responsiveness',
                    'Materials & checklists',
                    'Community/peer support',
                    'Platform or system provided',
                    'Personal guidance',
                  ].map((option) => (
                    <label key={option} className="block mt-2 group">
                      <input
                        type="checkbox"
                        name="supportiveAreas"
                        value={option}
                        onChange={handleChange}
                        className="mr-2 text-orange-500 focus:ring-orange-500 h-4 sm:h-5"
                      />
                      <span className="text-gray-700 group-hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="p-4 sm:p-6 bg-orange-50 border border-orange-200 rounded-xl shadow-sm transition-all duration-300">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-orange-600 mb-4 tracking-tight">
                Section 4: Confidence & Progress
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    How confident are you in building results in your first 30–60 days?
                  </label>
                  {[
                    '1 – Not confident',
                    '2 – Unsure',
                    '3 – Somewhat confident',
                    '4 – Confident',
                    '5 – Very confident',
                  ].map((option) => (
                    <label key={option} className="block mt-2 group">
                      <input
                        type="radio"
                        name="confidenceBuilding"
                        value={option}
                        onChange={handleChange}
                        required
                        className="mr-2 text-orange-500 focus:ring-orange-500 h-4 sm:h-5"
                      />
                      <span className="text-gray-700 group-hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    How do you feel about representing this brand in your region?
                  </label>
                  {['1 – Uncertain', '2 – Open', '3 – Neutral', '4 – Proud', '5 – Very proud & aligned'].map((option) => (
                    <label key={option} className="block mt-2 group">
                      <input
                        type="radio"
                        name="brandRepresentation"
                        value={option}
                        onChange={handleChange}
                        required
                        className="mr-2 text-orange-500 focus:ring-orange-500 h-4 sm:h-5"
                      />
                      <span className="text-gray-700 group-hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    What future do you see for yourself in this journey?
                  </label>
                  {[
                    'I’m still exploring',
                    'I see long-term potential',
                    'I want to build bigger with this',
                    'I’d consider expanding into more cities',
                    'I’d love to mentor others eventually',
                  ].map((option) => (
                    <label key={option} className="block mt-2 group">
                      <input
                        type="radio"
                        name="futureVision"
                        value={option}
                        onChange={handleChange}
                        required
                        className="mr-2 text-orange-500 focus:ring-orange-500 h-4 sm:h-5"
                      />
                      <span className="text-gray-700 group-hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentSection === 5 && (
            <div className="p-4 sm:p-6 bg-orange-50 border border-orange-200 rounded-xl shadow-sm transition-all duration-300">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-orange-600 mb-4 tracking-tight">
                Section 5: Experience & Suggestions
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    Was there any moment that stood out to you in a positive way?
                  </label>
                  <input
                    type="text"
                    name="positiveStandout"
                    value={formData.positiveStandout}
                    onChange={handleChange}
                    required
                    className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    Anything that could have made the start even smoother?
                  </label>
                  <input
                    type="text"
                    name="improvementSuggestion"
                    value={formData.improvementSuggestion}
                    onChange={handleChange}
                    required
                    className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
                <div className="p-4 sm:p-5 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <label className="block text-orange-600 font-medium text-sm sm:text-base">
                    How would you rate your overall experience so far?
                  </label>
                  {['1 – Poor', '2 – Fair', '3 – Good', '4 – Very Good', '5 – Excellent'].map((option) => (
                    <label key={option} className="block mt-2 group">
                      <input
                        type="radio"
                        name="overallExperience"
                        value={parseInt(option[0])}
                        onChange={handleChange}
                        required
                        className="mr-2 text-orange-500 focus:ring-orange-500 h-4 sm:h-5"
                      />
                      <span className="text-gray-700 group-hover:text-orange-500 transition-colors duration-200 text-sm sm:text-base">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between mt-4 sm:mt-6 gap-2 sm:gap-4">
            <button
              type="button"
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ease-in-out ${
                currentSection === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg'
              }`}
              onClick={prevSection}
              disabled={currentSection === 1}
            >
              Previous
            </button>
            {currentSection < 5 ? (
              <button
                type="button"
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ease-in-out ${
                  isSectionValid()
                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={nextSection}
                disabled={!isSectionValid()}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ease-in-out ${
                  isSectionValid()
                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isSectionValid()}
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-orange-200 transform transition-all duration-300 scale-100">
            <h2 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-4 text-center">Thank You!</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base text-center">
              Your feedback is truly appreciated and will play a pivotal role in enhancing the EarlyJobs franchise experience.
            </p>
            <button
              onClick={closePopup}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        input[type='radio'],
        input[type='checkbox'] {
          accent-color: #f97316;
        }
        input[type='text']:focus,
        input[type='email']:focus,
        input[type='url']:focus,
        input[type='tel']:focus,
        textarea:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.3);
        }
      `}</style>
    </div>
  );
};

export default FeedbackForm;