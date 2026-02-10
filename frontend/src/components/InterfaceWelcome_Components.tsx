import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "../store/hooks";
import {
  setQuestion,
  setQueryType,
  MimicSSE,
  UpdateChats, updateFavicon
} from "../store/InterfaceSlice";
import { ArrowUpRight } from "lucide-react";
import { AnswerAndData } from "../../utlis/PromptsWithResponse.ts";
import { setWebStatus } from "../store/websockteSlice";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { currentTime } from "../../utlis/Date.ts";
type WelcomeProps = {
  text: string; // dynamic word for the animated span
  isActive: boolean;
  setIsActive: (v: boolean) => void;
};
const Prompts = [
  { id: 1, prompt: "Recent findings about cancer treatment." },
  { id: 2, prompt: "How LLM's are affecting the market?" },
  // { id: 3, prompt: "Why getting a job has become so hard?" },
];
export const AgentWelcome: React.FC<WelcomeProps> = ({
  text,
  isActive,
  setIsActive,
}) => {
  const dispatch = useAppDispatch();

  const [choice, setChoice] = useState<number | null>(null);


  //imitate a response like flow
  useEffect(() => {
    if (!choice) {
      return;
    }

    const chosenPrompt = AnswerAndData.filter((el) => el.id === choice);
    if (!chosenPrompt) return;

    const user_id = uuid();
    const ai_id = uuid();

    dispatch(
      UpdateChats({
        id: user_id,
        sent_at: currentTime,
        sent_by: "You",
        message: {
          isComplete: true,
          content: chosenPrompt[0].prompt,
        },
      })
    );

    dispatch(
      UpdateChats({
        id: ai_id,
        sent_at: currentTime,
        sent_by: "AntiNode",
        message: {
          isComplete: false,
          content: "",
        },
      })
    );

    let i = 0;
    const interval = setInterval(() => {
      dispatch(
        setWebStatus({
          MessageId: ai_id,
          status: {
            message: chosenPrompt[0].events[i].status.message,
            data: chosenPrompt[0].events[i].status.data
          }
        })
      );

      i++;

      if (i === chosenPrompt[0].events.length) {
        dispatch(
          MimicSSE({
            id: ai_id,
            delta: chosenPrompt[0].markdown,
          })
        );
        if (chosenPrompt[0].id === 1) {
          dispatch(updateFavicon({
            MessageId: ai_id, icon: [
              `https://www.google.com/s2/favicons?domain=https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2025.1673098/full&sz=64`,
              `"https://pmc.ncbi.nlm.nih.gov/articles/PMC12528169/"`,
              "https://www.nature.com/articles/s43018-023-00697-7",
              "https://www.sciencedirect.com/science/article/pii/S1044579X25000379",
              "https://www.cell.com/cell-stem-cell/fulltext/S1934-5909(25)00265-6",
              "https://blog.championsoncology.com/blog/a-multiomics-driven-approach-for-advancements-in-pancreatic-cancer",
              "https://pubmed.ncbi.nlm.nih.gov/41112307/",
              "https://www.mdpi.com/2306-5354/12/8/849",
              "https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2025.1600527/full",
              "https://www.researchgate.net/publication/387352518_Integrating_OMICS-based_platforms_and_analytical_tools_for_diagnosis_and_management_of_pancreatic_cancer_a_review",
              "https://www.facebook.com/aacr.org/videos/experts-forecast-for-2026-is-about-smart-t-cells-next-gen-vaccines-ai-driven-com/887703310307216/",
              "https://www.onclive.com/view/artificial-intelligence-based-model-identifies-potential-resistance-drivers-to-car-t-cell-therapy-in-mcl",
              "https://pmc.ncbi.nlm.nih.gov/articles/PMC12441034/",
              "https://keck.usc.edu/news/next-generation-car-t-cells-could-expand-solid-cancer-treatment-options/",
              "https://www.linkedin.com/pulse/china-car-t-cell-therapy-agents-market-analysis-2026-size-r6qhc/",
              "https://iwcar-t.org/iwcar-t-2024-highlights/",
              "https://crisprmedicinenews.com/press-release-service/card/car-t-cell-therapy-market-research-2024-2025-size-forecasts-trials-and-trends-approved-car-t-t/",
              "https://bioinformant.com/product/car-t-report/",
              "https://www.oncologypipeline.com/apexonco/eha-2025-arcellx-still-hopes-safety-will-trump-efficacy",
              "https://www.delveinsight.com/blog/car-t-cell-therapies-for-multiple-myeloma",
              "https://letswinpc.org/research/kras-trial-recruiting-worldwide/",
              "https://ir.revmed.com/news-releases/news-release-details/revolution-medicines-announces-first-patient-randomized-rasolute",
              "https://www.onclive.com/view/daraxonrasib-demonstrates-efficacy-potential-to-inhibit-major-ras-on-variants-in-ras-pdac",
              "https://pmc.ncbi.nlm.nih.gov/articles/PMC12507178/",
              "https://www.mdpi.com/1424-8247/18/12/1788",
              "https://www.targetedonc.com/view/daraxonrasib-earns-fda-breakthrough-status-in-pancreatic-cancer",
              "https://aacrjournals.org/cancerdiscovery/article/15/7/1325/763195/Response-and-Resistance-to-RAS-Inhibition-in",
              "https://lustgarten.org/from-undruggable-to-unstoppable-the-state-of-kras-drug-development-in-pancreatic-cancer/",
              "https://www.clinicaltrials.gov/study/NCT06625320",
              "https://sigma.larvol.com/product.php?e1=902439&tab=newstrac",
              "https://www.fda.gov/news-events/press-announcements/fda-issues-guidance-modernizing-statistical-methods-clinical-trials",
              "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/use-bayesian-methodology-clinical-trials-drug-and-biological-products",
              "https://www.fda.gov/media/190505/download",
              "https://www.federalregister.gov/documents/2026/01/12/2026-00325/use-of-bayesian-methodology-in-clinical-trials-of-drug-and-biological-products-draft-guidance-for",
              "https://qa.raps.org/news-and-articles/news-articles/2026/1/fda-issues-guidance-on-use-of-bayesian-methods-to",
              "https://www.govinfo.gov/app/details/FR-2026-01-12/2026-00325",
              "https://public-inspection.federalregister.gov/2026-00325.pdf",
              "https://www.regulations.gov/document/FDA-2025-D-3217-0002",
              "https://www.parexel.com/insights/blog/advancing-rare-disease-research-exploring-opportunities-for-bayesian-methods-with-fdas-upcoming-guidance",
              "https://www.berryconsultants.com/resource/the-rumored-shift-to-a-one-trial-standard-for-fda-substantial-evidence",
            ], url: [
              "https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2025.1673098/full",
              "https://pmc.ncbi.nlm.nih.gov/articles/PMC12528169/",
              "https://www.nature.com/articles/s43018-023-00697-7",
              "https://www.sciencedirect.com/science/article/pii/S1044579X25000379",
              "https://www.cell.com/cell-stem-cell/fulltext/S1934-5909(25)00265-6",
              "https://blog.championsoncology.com/blog/a-multiomics-driven-approach-for-advancements-in-pancreatic-cancer",
              "https://pubmed.ncbi.nlm.nih.gov/41112307/",
              "https://www.mdpi.com/2306-5354/12/8/849",
              "https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2025.1600527/full",
              "https://www.researchgate.net/publication/387352518_Integrating_OMICS-based_platforms_and_analytical_tools_for_diagnosis_and_management_of_pancreatic_cancer_a_review",
              "https://www.facebook.com/aacr.org/videos/experts-forecast-for-2026-is-about-smart-t-cells-next-gen-vaccines-ai-driven-com/887703310307216/",
              "https://www.onclive.com/view/artificial-intelligence-based-model-identifies-potential-resistance-drivers-to-car-t-cell-therapy-in-mcl",
              "https://pmc.ncbi.nlm.nih.gov/articles/PMC12441034/",
              "https://keck.usc.edu/news/next-generation-car-t-cells-could-expand-solid-cancer-treatment-options/",
              "https://www.linkedin.com/pulse/china-car-t-cell-therapy-agents-market-analysis-2026-size-r6qhc/",
              "https://iwcar-t.org/iwcar-t-2024-highlights/",
              "https://crisprmedicinenews.com/press-release-service/card/car-t-cell-therapy-market-research-2024-2025-size-forecasts-trials-and-trends-approved-car-t-t/",
              "https://bioinformant.com/product/car-t-report/",
              "https://www.oncologypipeline.com/apexonco/eha-2025-arcellx-still-hopes-safety-will-trump-efficacy",
              "https://www.delveinsight.com/blog/car-t-cell-therapies-for-multiple-myeloma",
              "https://letswinpc.org/research/kras-trial-recruiting-worldwide/",
              "https://ir.revmed.com/news-releases/news-release-details/revolution-medicines-announces-first-patient-randomized-rasolute",
              "https://www.onclive.com/view/daraxonrasib-demonstrates-efficacy-potential-to-inhibit-major-ras-on-variants-in-ras-pdac",
              "https://pmc.ncbi.nlm.nih.gov/articles/PMC12507178/",
              "https://www.mdpi.com/1424-8247/18/12/1788",
              "https://www.targetedonc.com/view/daraxonrasib-earns-fda-breakthrough-status-in-pancreatic-cancer",
              "https://aacrjournals.org/cancerdiscovery/article/15/7/1325/763195/Response-and-Resistance-to-RAS-Inhibition-in",
              "https://lustgarten.org/from-undruggable-to-unstoppable-the-state-of-kras-drug-development-in-pancreatic-cancer/",
              "https://www.clinicaltrials.gov/study/NCT06625320",
              "https://sigma.larvol.com/product.php?e1=902439&tab=newstrac",
              "https://www.fda.gov/news-events/press-announcements/fda-issues-guidance-modernizing-statistical-methods-clinical-trials",
              "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/use-bayesian-methodology-clinical-trials-drug-and-biological-products",
              "https://www.fda.gov/media/190505/download",
              "https://www.federalregister.gov/documents/2026/01/12/2026-00325/use-of-bayesian-methodology-in-clinical-trials-of-drug-and-biological-products-draft-guidance-for",
              "https://qa.raps.org/news-and-articles/news-articles/2026/1/fda-issues-guidance-on-use-of-bayesian-methods-to",
              "https://www.govinfo.gov/app/details/FR-2026-01-12/2026-00325",
              "https://public-inspection.federalregister.gov/2026-00325.pdf",
              "https://www.regulations.gov/document/FDA-2025-D-3217-0002",
              "https://www.parexel.com/insights/blog/advancing-rare-disease-research-exploring-opportunities-for-bayesian-methods-with-fdas-upcoming-guidance",
              "https://www.berryconsultants.com/resource/the-rumored-shift-to-a-one-trial-standard-for-fda-substantial-evidence",
            ]
          }))
        }

        clearInterval(interval);
      }
    }, 2000);

    // return () => clearInterval(interval);
  }, [choice]);

  return (
    <section
      role="region"
      aria-label="Welcome to Antinode"
      onClick={() => isActive && setIsActive(false)}
      className="mx-auto w-full max-w-2xl px-6 pt-10 pb-16 flex flex-col gap-8 space-grotesk"
    >



      {/* Core prompt */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold leading-tight bai-jamjuree-bold">
          What are we{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={text}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-clip-text text-transparent bg-gradient-to-br from-orange-400 via-red-500 to-pink-400"
            >
              {text}
            </motion.span>
          </AnimatePresence>{" "}
          today?
        </h1>


      </div>

      {/* Primary action */}
      <div className="flex gap-2 w-full flex-col items-normal justify-center  ">
        <section>
          <h1 className="bai-jamjuree-semibold text-xl">
            Not sure where to start?
          </h1>
          <span className="text-gray-600 dark:text-gray-400 bai-jamjuree-regular text-sm">
            Try these
          </span>
        </section>

        <div className="">
          {Prompts.map((e, i) => {
            return (
              <ul
                onClick={() => {
                  dispatch(setQuestion(e.prompt));
                  dispatch(setQueryType("Web Search"));
                  setChoice(e.id);
                  // dispatch(WebSearchHandler(question));
                }}
                className="space-grotesk text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center justify-start gap-2 cursor-pointer"
                role="button"
                key={i}
              >
                {e.prompt}
                <ArrowUpRight size={15} color="green" />
              </ul>
            );
          })}
        </div>
      </div>
    </section>
  );
};
