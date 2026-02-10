import { togglePreference, UpdatePreference } from "../store/AuthSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toast } from "sonner";

const PreferenceToggle = () => {
  const dispatch = useAppDispatch();
  const { AllowedTrainingModels } = useAppSelector((state) => state.auth);
  return (
    <section className=" ">
      {AllowedTrainingModels && (
        <div className="grid grid-cols-1 gap-3 md:hidden lg:hidden">
          <h2 className="space-grotesk text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">
            Allow training models
          </h2>

          <button
            type="button"
            onClick={() => {
              // Optimistic update logic
              const newValue = AllowedTrainingModels === "YES" ? "NO" : "YES";
              dispatch(togglePreference(newValue));

              dispatch(UpdatePreference(newValue))
                .unwrap()
                .then(() => toast.message("Preference updated"))
                .catch(() => {
                  toast.message("Could not update the preferences");
                  // Revert logic
                  dispatch(
                    togglePreference(
                      AllowedTrainingModels === "YES" ? "NO" : "YES"
                    )
                  );
                });
            }}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
              transition-colors duration-200 ease-in-out focus:outline-none 
              ${
                AllowedTrainingModels === "YES"
                  ? "bg-sky-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }
            `}
          >
            <span className="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                transition duration-200 ease-in-out
                ${
                  AllowedTrainingModels === "YES"
                    ? "translate-x-5"
                    : "translate-x-0"
                }
              `}
            />
          </button>
        </div>
      )}
    </section>
  );
};

export default PreferenceToggle;
