/** A typeable quote. `text` is plain ASCII with single spaces; `source` is the attribution shown to the user. */
export interface Quote {
  text: string;
  source: string;
}

export type QuoteLength = "short" | "medium" | "long";

export const QUOTE_LENGTHS = ["short", "medium", "long"] as const;

/** Quotes of up to this many words are "short". */
export const SHORT_MAX_WORDS = 20;
/** Quotes of up to this many words (and more than `SHORT_MAX_WORDS`) are "medium"; longer ones are "long". */
export const MEDIUM_MAX_WORDS = 45;

/** Random source returning a float in [0, 1); injectable so tests can be deterministic. */
type Rng = () => number;

/**
 * Public-domain quotes only (authors who died well over 70 years ago, or old translations).
 * Plain ASCII: straight quotes, "-" for dashes, no ellipsis character.
 */
export const QUOTES: readonly Quote[] = [
  { text: "Begin at the beginning, and go on till you come to the end: then stop.", source: "Lewis Carroll, Alice's Adventures in Wonderland" },
  { text: "All that we see or seem is but a dream within a dream.", source: "Edgar Allan Poe" },
  { text: "You see, but you do not observe. The distinction is clear.", source: "Arthur Conan Doyle, A Scandal in Bohemia" },
  { text: "The truth is rarely pure and never simple.", source: "Oscar Wilde, The Importance of Being Earnest" },
  { text: "We know what we are, but know not what we may be.", source: "William Shakespeare, Hamlet" },
  { text: "Our doubts are traitors, and make us lose the good we oft might win, by fearing to attempt.", source: "William Shakespeare, Measure for Measure" },
  { text: "Cowards die many times before their deaths; the valiant never taste of death but once.", source: "William Shakespeare, Julius Caesar" },
  { text: "Good night, good night! Parting is such sweet sorrow, that I shall say good night till it be morrow.", source: "William Shakespeare, Romeo and Juliet" },
  { text: "The mass of men lead lives of quiet desperation.", source: "Henry David Thoreau, Walden" },
  { text: "The question is not what you look at, but what you see.", source: "Henry David Thoreau, Journal" },
  { text: "Whoso would be a man must be a nonconformist.", source: "Ralph Waldo Emerson, Self-Reliance" },
  { text: "We are all in the gutter, but some of us are looking at the stars.", source: "Oscar Wilde, Lady Windermere's Fan" },
  { text: "To live is the rarest thing in the world. Most people exist, that is all.", source: "Oscar Wilde, The Soul of Man under Socialism" },
  { text: "No one is useless in this world who lightens the burdens of another.", source: "Charles Dickens, Our Mutual Friend" },
  { text: "There are strings in the human heart that had better not be vibrated.", source: "Charles Dickens, Barnaby Rudge" },
  { text: "Well done is better than well said.", source: "Benjamin Franklin, Poor Richard's Almanack" },
  { text: "Courage is resistance to fear, mastery of fear - not absence of fear.", source: "Mark Twain, Pudd'nhead Wilson" },
  { text: "Always do right. This will gratify some people and astonish the rest.", source: "Mark Twain" },
  { text: "Few things are harder to put up with than the annoyance of a good example.", source: "Mark Twain, Pudd'nhead Wilson" },
  { text: "I declare after all there is no enjoyment like reading!", source: "Jane Austen, Pride and Prejudice" },
  { text: "The best way of avenging thyself is not to become like the wrong doer.", source: "Marcus Aurelius, Meditations" },
  { text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", source: "Marcus Aurelius, Meditations" },
  { text: "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.", source: "Arthur Conan Doyle, The Sign of the Four" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", source: "Louisa May Alcott, Little Women" },
  { text: "The mass of men lead lives of quiet desperation. What is called resignation is confirmed desperation. From the desperate city you go into the desperate country, and have to console yourself with the bravery of minks and muskrats.", source: "Henry David Thoreau, Walden" },
  { text: "He that outlives this day, and comes safe home, will stand a tip-toe when this day is named, and rouse him at the name of Crispian.", source: "William Shakespeare, Henry V" },
  { text: "Friends, Romans, countrymen, lend me your ears; I come to bury Caesar, not to praise him. The evil that men do lives after them; the good is oft interred with their bones.", source: "William Shakespeare, Julius Caesar" },
  { text: "The quality of mercy is not strained; it droppeth as the gentle rain from heaven upon the place beneath. It is twice blest: it blesseth him that gives and him that takes. 'Tis mightiest in the mightiest: it becomes the throned monarch better than his crown; his sceptre shows the force of temporal power, the attribute to awe and majesty, wherein doth sit the dread and fear of kings.", source: "William Shakespeare, The Merchant of Venice" },
  { text: "It is a far, far better thing that I do, than I have ever done; it is a far, far better rest that I go to than I have ever known.", source: "Charles Dickens, A Tale of Two Cities" },
  { text: "In vain I have struggled. It will not do. My feelings will not be repressed. You must allow me to tell you how ardently I admire and love you.", source: "Jane Austen, Pride and Prejudice" },
  { text: "She had been forced into prudence in her youth, she learned romance as she grew older: the natural sequel of an unnatural beginning.", source: "Jane Austen, Persuasion" },
  { text: "To believe your own thought, to believe that what is true for you in your private heart is true for all men - that is genius.", source: "Ralph Waldo Emerson, Self-Reliance" },
  { text: "Once upon a midnight dreary, while I pondered, weak and weary, over many a quaint and curious volume of forgotten lore, while I nodded, nearly napping, suddenly there came a tapping, as of some one gently rapping, rapping at my chamber door.", source: "Edgar Allan Poe, The Raven" },
  { text: "It is a capital mistake to theorize before one has data. Insensibly one begins to twist facts to suit theories, instead of theories to suit facts.", source: "Arthur Conan Doyle, A Scandal in Bohemia" },
  { text: "Mankind was my business. The common welfare was my business; charity, mercy, forbearance, and benevolence, were, all, my business. The dealings of my trade were but a drop of water in the comprehensive ocean of my business!", source: "Charles Dickens, A Christmas Carol" },
  { text: "O Captain! my Captain! our fearful trip is done, the ship has weather'd every rack, the prize we sought is won, the port is near, the bells I hear, the people all exulting.", source: "Walt Whitman, O Captain! My Captain!" },
  { text: "If you can keep your head when all about you are losing theirs and blaming it on you, if you can trust yourself when all men doubt you, but make allowance for their doubting too.", source: "Rudyard Kipling, If" },
  { text: "Begin the morning by saying to thyself, I shall meet with the busy-body, the ungrateful, arrogant, deceitful, envious, unsocial. All these things happen to them by reason of their ignorance of what is good and evil.", source: "Marcus Aurelius, Meditations" },
  { text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", source: "Jane Austen, Pride and Prejudice" },
  { text: "Tomorrow, and tomorrow, and tomorrow, creeps in this petty pace from day to day, to the last syllable of recorded time.", source: "William Shakespeare, Macbeth" },
  { text: "All the world's a stage, and all the men and women merely players; they have their exits and their entrances, and one man in his time plays many parts.", source: "William Shakespeare, As You Like It" },
  { text: "This above all: to thine own self be true, and it must follow, as the night the day, thou canst not then be false to any man.", source: "William Shakespeare, Hamlet" },
  { text: "To be, or not to be, that is the question: whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles, and by opposing end them.", source: "William Shakespeare, Hamlet" },
  { text: "If one advances confidently in the direction of his dreams, and endeavors to live the life which he has imagined, he will meet with a success unexpected in common hours.", source: "Henry David Thoreau, Walden" },
  { text: "A foolish consistency is the hobgoblin of little minds, adored by little statesmen and philosophers and divines.", source: "Ralph Waldo Emerson, Self-Reliance" },
  { text: "There is only one thing in the world worse than being talked about, and that is not being talked about.", source: "Oscar Wilde, The Picture of Dorian Gray" },
  { text: "The only way to get rid of a temptation is to yield to it. Resist it, and your soul grows sick with longing for the things it has forbidden to itself.", source: "Oscar Wilde, The Picture of Dorian Gray" },
  { text: "Training is everything. The peach was once a bitter almond; cauliflower is nothing but cabbage with a college education.", source: "Mark Twain, Pudd'nhead Wilson" },
  { text: "Truth is stranger than fiction, but it is because Fiction is obliged to stick to possibilities; Truth isn't.", source: "Mark Twain, Following the Equator" },
  { text: "Travel is fatal to prejudice, bigotry, and narrow-mindedness, and many of our people need it sorely on these accounts. Broad, wholesome, charitable views of men and things cannot be acquired by vegetating in one little corner of the earth all one's lifetime.", source: "Mark Twain, The Innocents Abroad" },
  { text: "Do not act as if thou wert going to live ten thousand years. Death hangs over thee. While thou livest, while it is in thy power, be good.", source: "Marcus Aurelius, Meditations" },
  { text: "We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness. That to secure these rights, Governments are instituted among Men, deriving their just powers from the consent of the governed.", source: "Thomas Jefferson, Declaration of Independence" },
  { text: "Hope is the thing with feathers that perches in the soul, and sings the tune without the words, and never stops at all.", source: "Emily Dickinson" },
  { text: "I am no bird; and no net ensnares me: I am a free human being with an independent will.", source: "Charlotte Bronte, Jane Eyre" },
  { text: "Why, sometimes I've believed as many as six impossible things before breakfast.", source: "Lewis Carroll, Through the Looking-Glass" },
  { text: "I celebrate myself, and sing myself, and what I assume you shall assume, for every atom belonging to me as good belongs to you.", source: "Walt Whitman, Song of Myself" },
  { text: "Never value anything as profitable to thyself which shall compel thee to break thy promise, to lose thy self-respect, to hate any man, to suspect, to curse, to act the hypocrite.", source: "Marcus Aurelius, Meditations" },
  { text: "When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.", source: "Thomas Jefferson, Declaration of Independence" },
  { text: "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure.", source: "Abraham Lincoln, Gettysburg Address" },
  { text: "With malice toward none, with charity for all, with firmness in the right as God gives us to see the right, let us strive on to finish the work we are in, to bind up the nation's wounds, to care for him who shall have borne the battle and for his widow and his orphan, to do all which may achieve and cherish a just and lasting peace among ourselves and with all nations.", source: "Abraham Lincoln, Second Inaugural Address" },
  { text: "We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.", source: "Preamble to the Constitution of the United States" },
  { text: "Call me Ishmael. Some years ago - never mind how long precisely - having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.", source: "Herman Melville, Moby-Dick" },
  { text: "Our life is frittered away by detail. An honest man has hardly need to count more than his ten fingers, or in extreme cases he may add his ten toes, and lump the rest. Simplicity, simplicity, simplicity! I say, let your affairs be as two or three, and not a hundred or a thousand.", source: "Henry David Thoreau, Walden" },
  { text: "I will honour Christmas in my heart, and try to keep it all the year. I will live in the Past, the Present, and the Future. The Spirits of all Three shall strive within me. I will not shut out the lessons that they teach. Oh, tell me I may sponge away the writing on this stone!", source: "Charles Dickens, A Christmas Carol" },
  { text: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.", source: "Charles Dickens, A Tale of Two Cities" },
  { text: "Tomorrow, and tomorrow, and tomorrow, creeps in this petty pace from day to day, to the last syllable of recorded time, and all our yesterdays have lighted fools the way to dusty death. Out, out, brief candle! Life's but a walking shadow, a poor player that struts and frets his hour upon the stage and then is heard no more.", source: "William Shakespeare, Macbeth" },
  { text: "To be, or not to be, that is the question: whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles, and by opposing end them. To die, to sleep - no more; and by a sleep to say we end the heart-ache and the thousand natural shocks that flesh is heir to.", source: "William Shakespeare, Hamlet" },
  { text: "It is rather for us to be here dedicated to the great task remaining before us - that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion - that we here highly resolve that these dead shall not have died in vain - that this nation, under God, shall have a new birth of freedom - and that government of the people, by the people, for the people, shall not perish from the earth.", source: "Abraham Lincoln, Gettysburg Address" },
  { text: "Remember that time is money. He that can earn ten shillings a day by his labor, and goes abroad, or sits idle, one half of that day, though he spends but sixpence during his diversion or idleness, ought not to reckon that the only expense; he has really spent, or rather thrown away, five shillings besides.", source: "Benjamin Franklin, Advice to a Young Tradesman" },
  { text: "It was a close place. I took it up, and held it in my hand. I was a-trembling, because I'd got to decide, forever, betwixt two things, and I knowed it. I studied a minute, sort of holding my breath, and then I says to myself: 'All right, then, I'll go to hell' - and tore it up.", source: "Mark Twain, Adventures of Huckleberry Finn" },
  { text: "You pierce my soul. I am half agony, half hope. Tell me not that I am too late, that such precious feelings are gone for ever. I offer myself to you again with a heart even more your own than when you almost broke it, eight years and a half ago.", source: "Jane Austen, Persuasion" },
  { text: "Finish every day and be done with it. You have done what you could. Some blunders and absurdities no doubt crept in; forget them as soon as you can. Tomorrow is a new day; you shall begin it serenely and with too high a spirit to be cumbered with your old nonsense.", source: "Ralph Waldo Emerson" },
  { text: "I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived. I did not wish to live what was not life, living is so dear.", source: "Henry David Thoreau, Walden" },
];

/** Number of whitespace-separated words in a quote. */
export const countWords = (quote: Quote): number => quote.text.split(" ").length;

/** Classifies a quote by word count: short (<= 20), medium (21-45) or long (46+). */
export function getQuoteLength(quote: Quote): QuoteLength {
  const words = countWords(quote);
  if (words <= SHORT_MAX_WORDS) return "short";
  return words <= MEDIUM_MAX_WORDS ? "medium" : "long";
}

/**
 * A random quote of the given length tier. When `excludeText` is given, that quote is avoided
 * unless it is the only one in the tier.
 */
export function pickQuote(length: QuoteLength, rng: Rng = Math.random, excludeText?: string): Quote {
  const tier = QUOTES.filter((quote) => getQuoteLength(quote) === length);
  const candidates = tier.filter((quote) => quote.text !== excludeText);
  const pool = candidates.length > 0 ? candidates : tier;
  return pool[Math.floor(rng() * pool.length)];
}

/** The words to type for a quote: exact case and punctuation. */
export const quoteToWords = (quote: Quote): string[] => quote.text.split(" ");
