const Talkbtn = () => {
  const number = "+38348115665";
  const message = "Hey i would like to get in touch.";
  const encodedMessage = encodeURIComponent(message);

  return (
    <a
      href={`https://wa.me/${number}?text=${encodedMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 bg-button border-3 border-button hover:bg-transparent hover:text-button text-background font-bold uppercase cursor-pointer"
    >
      Let's talk
    </a>
  );
};

export default Talkbtn;
