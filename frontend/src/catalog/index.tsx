import { useThemeContext } from 'src/shared/contexts/theme';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import CatalogTab from 'src/catalog/components/catalog';

const Catalog = () => {
  const { setTheme } = useThemeContext();

  useEffectOnce(() => {
    setTheme('lofi');
  });

  return (
    <div>
      <h2 className="tab tab-bordered tab-active cursor-text select-text font-normal m-0">Catalog</h2>
      <div className="pt-4 sm:pt-6">
        <CatalogTab />
      </div>
    </div>
  );
};

export default Catalog;
