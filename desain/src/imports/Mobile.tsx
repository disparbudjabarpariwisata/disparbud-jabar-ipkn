import svgPaths from "./svg-jihryzq5ee";
import imgImage from "figma:asset/e723a3a921b7364a9fd5c9987650e639e5e37b99.png";
import imgImage1 from "figma:asset/4c364980273eb285a6b98bd2ce5d58313866c189.png";
import imgImage2 from "figma:asset/385737d7a5d62e174796a599ef23edf3d6bc4011.png";
import imgHero1 from "figma:asset/afe17b47905a1f3498944aac61b527d2096478c6.png";

function Text() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[20px] text-black tracking-[-0.3px] w-full">
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
    <li className="content-stretch flex flex-col gap-[24px] items-start min-w-[224px] relative rounded-[8px] shrink-0 w-full" data-name="Card 1">
      <div aria-hidden="true" className="aspect-[327/436] relative rounded-[16px] shrink-0 w-full" data-name="Image" role="presentation">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgImage} />
      </div>
      <Text />
    </li>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[20px] text-black tracking-[-0.3px] w-full">
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
    <li className="content-stretch flex flex-col gap-[24px] items-start min-w-[224px] relative rounded-[8px] shrink-0 w-full" data-name="Card 2">
      <div aria-hidden="true" className="aspect-[327/436] relative rounded-[16px] shrink-0 w-full" data-name="Image" role="presentation">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgImage1} />
      </div>
      <Text1 />
    </li>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[20px] text-black tracking-[-0.3px] w-full">
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
    <li className="content-stretch flex flex-col gap-[24px] items-start min-w-[224px] relative rounded-[8px] shrink-0 w-full" data-name="Card 3">
      <div aria-hidden="true" className="aspect-[327/436] relative rounded-[16px] shrink-0 w-full" data-name="Image" role="presentation">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgImage2} />
      </div>
      <Text2 />
    </li>
  );
}

function FeatureCards() {
  return (
    <ul className="absolute bottom-[-1143px] content-stretch flex flex-col gap-[48px] h-[1888px] items-start left-0 px-[24px] py-[80px] right-0" data-name="Feature cards 1">
      <Card />
      <Card1 />
      <Card2 />
    </ul>
  );
}

function Hero() {
  return (
    <section className="absolute block h-[351px] left-0 right-0 top-0" data-name="Hero 1">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHero1} />
    </section>
  );
}

export default function Mobile() {
  return (
    <div className="bg-white relative size-full" data-name="Mobile">
      <FeatureCards />
      <Hero />
      <div className="absolute bg-white h-[104px] left-[17px] right-[17px] rounded-bl-[50px] rounded-br-[50px] top-[-2px]" />
      <div className="absolute h-[14px] left-[44px] top-[30px] w-[30px]">
        <div className="absolute inset-[-10.71%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 17">
            <path d={svgPaths.p23725900} id="Vector 1" stroke="var(--stroke-0, #919191)" strokeLinecap="round" strokeWidth="3" />
          </svg>
        </div>
      </div>
    </div>
  );
}