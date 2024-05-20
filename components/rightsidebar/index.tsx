import Color from "@/components/settings/Color";
import Dimensions from "@/components/settings/Dimensions";
import Export from "@/components/settings/Export";
import Text from "@/components/settings/Text";
import { modifyShape } from "@/lib/shapes";
import { RightSidebarProps } from "@/types/type";
import { useRef } from "react";

const RightSidebar = ({ elementAttributes, setElementAttributes, fabricRef, activeObjectRef, isEditingRef, syncShapeInStorage }: RightSidebarProps) => {
  const { width, height, fontFamily, fontSize, fontWeight, fill, stroke } = elementAttributes;

  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true;
    setElementAttributes((prev) => ({ ...prev, [property]: value }));
    modifyShape({ canvas: fabricRef.current as fabric.Canvas, property, value, activeObjectRef, syncShapeInStorage });
  };

  return (
    <section className="flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-w-[227px] sticky right-0 h-full max-sm:hidden select-none">
      <h3 className="px-5 pt-4 text-xs uppercase">Design</h3>
      <span className="text-xs text-primary-grey-300 mt-3 px-5 border-b border-primary-gray-200 pb-4">Make changes to canvas as you like</span>

      <Dimensions width={width} height={height} isEditingRef={isEditingRef} handleInputChange={handleInputChange} />
      <Text fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight} handleInputChange={handleInputChange} />
      <Color inputRef={colorInputRef} attribute={fill} placeholder="color" handleInputChange={handleInputChange} attributeType="fill" />
      <Color inputRef={strokeInputRef} attribute={stroke} placeholder="stroke" handleInputChange={handleInputChange} attributeType="stroke" />
      <Export />
    </section>
  );
};

export default RightSidebar;
