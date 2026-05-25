import { useAppSelector } from '../store/hooks';

export const LogoRender = () => {
  const { isDarkMode } = useAppSelector(s => s.auth);
  return (<>
    <img className='h-10 w-10' src={isDarkMode === true ? "/Antinode-AI-darkmode.png" : "/Antinode-AI-lightmode.png"} loading="lazy" alt="Antinode-AI" />
  </>)
};
