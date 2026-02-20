import imgImage from "figma:asset/e723a3a921b7364a9fd5c9987650e639e5e37b99.png";
import imgImage1 from "figma:asset/4c364980273eb285a6b98bd2ce5d58313866c189.png";
import imgImage2 from "figma:asset/385737d7a5d62e174796a599ef23edf3d6bc4011.png";
import imgHero1 from "figma:asset/afe17b47905a1f3498944aac61b527d2096478c6.png";

function Text() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[24px] text-black tracking-[-0.48px] w-full">
        <h5 className="block leading-[1.2] whitespace-pre-wrap">A small card</h5>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[18px] text-[rgba(0,0,0,0.55)] tracking-[-0.09px] w-full">
        <p className="leading-[1.45] whitespace-pre-wrap">Call out a feature, benefit, or value of your site that can stand on its own.</p>
      </div>
    </div>
  );
}

function Card() {
  return (
    <li className="content-stretch flex flex-[1_0_0] flex-col gap-[32px] items-start max-w-[388px] min-h-px min-w-[336px] relative rounded-[8px]" data-name="Card 1">
      <div aria-hidden="true" className="aspect-[362.6666564941406/483] relative rounded-[16px] shrink-0 w-full" data-name="Image" role="presentation">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgImage} />
      </div>
      <Text />
    </li>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[24px] text-black tracking-[-0.48px] w-full">
        <h5 className="block leading-[1.2] whitespace-pre-wrap">A little glimpse</h5>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[18px] text-[rgba(0,0,0,0.55)] tracking-[-0.09px] w-full">
        <p className="leading-[1.45] whitespace-pre-wrap">Call out a feature, benefit, or value of your site that can stand on its own.</p>
      </div>
    </div>
  );
}

function Card1() {
  return (
    <li className="content-stretch flex flex-[1_0_0] flex-col gap-[32px] items-start max-w-[388px] min-h-px min-w-[336px] relative rounded-[8px]" data-name="Card 2">
      <div aria-hidden="true" className="aspect-[362.66668701171875/483] relative rounded-[16px] shrink-0 w-full" data-name="Image" role="presentation">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgImage1} />
      </div>
      <Text1 />
    </li>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[24px] text-black tracking-[-0.48px] w-full">
        <h5 className="block leading-[1.2] whitespace-pre-wrap">A quick peek</h5>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[18px] text-[rgba(0,0,0,0.55)] tracking-[-0.09px] w-full">
        <p className="leading-[1.45] whitespace-pre-wrap">Call out a feature, benefit, or value of your site that can stand on its own.</p>
      </div>
    </div>
  );
}

function Card2() {
  return (
    <li className="content-stretch flex flex-[1_0_0] flex-col gap-[32px] items-start max-w-[388px] min-h-px min-w-[336px] relative rounded-[8px]" data-name="Card 3">
      <div aria-hidden="true" className="aspect-[362.66668701171875/483] relative rounded-[16px] shrink-0 w-full" data-name="Image" role="presentation">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgImage2} />
      </div>
      <Text2 />
    </li>
  );
}

function FeatureCards() {
  return (
    <ul className="absolute bottom-[-112px] content-stretch flex gap-[32px] items-start justify-center left-[-4px] px-[64px] py-[120px] right-[4px]" data-name="Feature cards 1">
      <Card />
      <Card1 />
      <Card2 />
    </ul>
  );
}

function Hero() {
  return (
    <section className="absolute block h-[348px] left-0 right-0 top-0" data-name="Hero 1">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHero1} />
    </section>
  );
}

export default function Desktop() {
  return (
    <div className="bg-white relative size-full" data-name="Desktop">
      <FeatureCards />
      <Hero />
      <div className="absolute bg-white h-[104px] left-[70px] rounded-bl-[50px] rounded-br-[50px] top-[-2px] w-[1131px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[390px] not-italic text-[12px] text-black top-[35px]">why west java ?</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[571px] not-italic text-[12px] text-black top-[35px]">where to visit ?</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[748px] not-italic text-[12px] text-black top-[32px]">what to do ?</p>
    </div>
  );
}