const Talkbtn = () => {
  const number = "+971585661306";
  const message = "Pershendetje jam i interesuar.";
  const encodedMessage = encodeURIComponent(message);

  return (
    <a
      href={`https://wa.me/${number}?text=${encodedMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 bg-button border-3 border-button hover:bg-transparent hover:text-button text-background font-bold uppercase cursor-pointer"
    >
      Me Kontakto
    </a>
  );
};

export default Talkbtn;
